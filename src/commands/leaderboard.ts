import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as db from '../db';
import { Command, Element, ELEMENT_INFO } from '../shared/constants';

export const leaderboardCmd: Command = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('View the top benders in this server'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const top = await db.getLeaderboard(guildId);

    if (top.length === 0) {
      await interaction.reply(
        'No benders have registered in this server yet! Use `/choose-element` to begin your journey.',
      );
      return;
    }

    const lines = await Promise.all(
      top.map(async (u, i) => {
        const member = await interaction.guild!.members.fetch(u.user_id).catch(() => null);
        const name = member ? member.user.username : 'Unknown';
        const info = u.element ? ELEMENT_INFO[u.element as Element] : { emoji: '🍵' };
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        return `${medal} ${info.emoji} **${name}** — Level ${u.level} (${u.xp} XP)`;
      }),
    );

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('🏆 Top Benders')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'It is important to draw wisdom from many different places.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
