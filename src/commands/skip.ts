import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as music from '../services/music';

export const skipCmd: Command = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current track'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = music.getQueue(interaction.guildId!);

    if (!queue || !queue.current) {
      await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
      return;
    }

    const skipped = queue.current.title;
    queue.player.stop();
    await interaction.reply(`⏭️ Skipped **${skipped}**.`);
  },
};
