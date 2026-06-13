import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const stopCmd: Command = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop playback and clear the queue'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue) {
      await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
      return;
    }

    music.destroyQueue(interaction.guildId!);
    await interaction.reply('⏹️ Stopped and cleared the queue. Until next time.');
  },
};
