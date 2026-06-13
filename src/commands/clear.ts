import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const clearCmd: Command = {
  data: new SlashCommandBuilder().setName('clear').setDescription('Clear all tracks from the queue'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || queue.tracks.length === 0) {
      await interaction.reply({ content: 'The queue is already empty.', ephemeral: true });
      return;
    }

    const count = queue.tracks.length;
    queue.tracks = [];
    await interaction.reply(`🧹 Cleared **${count}** track${count === 1 ? '' : 's'} from the queue.`);
  },
};
