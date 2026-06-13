import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getRank, getLevelProgress, xpForLevel, totalXpForLevel } from '../services/leveling';
import * as db from '../db';
import { Command, Element, ELEMENT_INFO } from '../shared/constants';

export const profileCmd: Command = {
  data: new SlashCommandBuilder().setName('profile').setDescription('View your bender profile and stats'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    await db.createUser(userId, guildId);
    const user = (await db.getUser(userId, guildId))!;

    const element = user.element as Element | null;
    const info = element ? ELEMENT_INFO[element] : { color: 0x8b4513, emoji: '🍵', name: 'Undecided' };
    const rank = getRank(element, user.level);
    const progress = getLevelProgress(user.level, user.xp);
    const xpNeeded = xpForLevel(user.level);
    const xpIntoLevel = user.xp - totalXpForLevel(user.level);

    const filled = Math.floor(progress / 10);
    const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    const embed = new EmbedBuilder()
      .setColor(info.color)
      .setTitle(`${info.emoji} ${interaction.user.username}'s Bender Profile`)
      .addFields(
        { name: 'Element', value: element ? `${info.emoji} ${info.name}` : '❓ Not yet chosen', inline: true },
        { name: 'Level', value: `${user.level}`, inline: true },
        { name: 'Rank', value: rank, inline: true },
        { name: 'XP Progress', value: `${progressBar} ${xpIntoLevel}/${xpNeeded}`, inline: false },
        { name: 'Total XP', value: `${user.xp}`, inline: true },
        { name: 'Wisdom Received', value: `${user.wisdom_received}`, inline: true },
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'The journey of a thousand miles begins with a single step.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
