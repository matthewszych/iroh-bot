import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const queueCmd: Command = {
  data: new SlashCommandBuilder().setName('queue').setDescription('View the current music queue'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || !queue.current) {
      await interaction.reply({ content: 'The queue is empty. Use `/play` to add some music!', ephemeral: true });
      return;
    }

    const loopLabel = queue.loop === 'off' ? '' : ` • Loop: ${queue.loop === 'track' ? '🔂 Track' : '🔁 Queue'}`;

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle('🎶 Music Queue')
      .setDescription(
        `**Now Playing:**\n🎵 **${queue.current.title}** (\`${queue.current.duration}\`)${loopLabel}\n\n` +
          `**Up Next:**\n${music.formatQueue(queue)}`,
      )
      .setFooter({ text: `${queue.tracks.length} track${queue.tracks.length === 1 ? '' : 's'} in queue` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
