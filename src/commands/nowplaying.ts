import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const nowPlayingCmd: Command = {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Show the currently playing track'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || !queue.current) {
      await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
      return;
    }

    const loopLabel = queue.loop === 'off' ? '' : `\nLoop: ${queue.loop === 'track' ? '🔂 Track' : '🔁 Queue'}`;

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle('🎵 Now Playing')
      .setDescription(
        `**${queue.current.title}**\n\`${queue.current.duration}\` • Requested by ${queue.current.requestedBy}${loopLabel}`,
      )
      .setThumbnail(queue.current.thumbnail)
      .setFooter({ text: 'Music is the universal language of the spirit.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
