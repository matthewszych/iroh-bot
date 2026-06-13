import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const pauseCmd: Command = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pause or resume the current track'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || !queue.current) {
      await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
      return;
    }

    if (queue.player.state.status === AudioPlayerStatus.Paused) {
      queue.player.unpause();
      await interaction.reply('▶️ Resumed.');
    } else {
      queue.player.pause();
      await interaction.reply('⏸️ Paused.');
    }
  },
};
