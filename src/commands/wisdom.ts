import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getWisdom } from '../services/wisdom';
import { generateWisdom } from '../services/ai';
import { checkLevelUp, getLevelUpMessage, getRank, XP_PER_WISDOM } from '../services/leveling';
import * as db from '../db';
import { Command, Element, ELEMENT_INFO } from '../shared/constants';

export const wisdomCmd: Command = {
  data: new SlashCommandBuilder().setName('wisdom').setDescription('Receive a piece of wisdom from Uncle Iroh'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    await db.createUser(userId, guildId);
    const user = (await db.getUser(userId, guildId))!;

    let quote: string;
    let isAI = false;
    if (process.env.ENABLE_AI === 'true' && process.env.OPENAI_API_KEY && Math.random() < 0.3) {
      try {
        quote = await generateWisdom(user.element);
        isAI = true;
      } catch {
        quote = getWisdom(user.element);
      }
    } else {
      quote = getWisdom(user.element);
    }

    await db.insertWisdomLog(userId, guildId, quote);
    await db.incrementWisdomCount(userId, guildId);
    await db.addXp(XP_PER_WISDOM, userId, guildId);

    const info = user.element ? ELEMENT_INFO[user.element as Element] : { color: 0x8b4513, emoji: '🍵' };

    const embed = new EmbedBuilder()
      .setColor(info.color)
      .setAuthor({ name: 'Uncle Iroh', iconURL: interaction.client.user.displayAvatarURL() })
      .setDescription(`*${quote}*`)
      .setFooter({ text: `${info.emoji} +${XP_PER_WISDOM} XP${isAI ? ' • ✨ AI' : ''}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const updatedUser = (await db.getUser(userId, guildId))!;
    const newLevel = checkLevelUp(updatedUser.level, updatedUser.xp);
    if (newLevel) {
      await db.setLevel(newLevel, userId, guildId);
      const rank = getRank(updatedUser.element, newLevel);
      const lvlEmbed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('⬆️ Level Up!')
        .setDescription(
          `${getLevelUpMessage()}\n\n**${interaction.user.username}** is now level **${newLevel}** — *${rank}*!`,
        )
        .setTimestamp();
      await interaction.followUp({ embeds: [lvlEmbed] });
    }
  },
};
