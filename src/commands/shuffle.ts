import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const shuffleCmd: Command = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the music queue'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || queue.tracks.length < 2) {
      await interaction.reply({ content: 'Not enough tracks in the queue to shuffle.', ephemeral: true });
      return;
    }

    for (let i = queue.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
    }

    await interaction.reply(`🔀 Shuffled **${queue.tracks.length}** tracks in the queue.`);
  },
};
