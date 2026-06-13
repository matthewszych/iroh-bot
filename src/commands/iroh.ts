import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getGreeting } from '../services/wisdom';
import { Command } from '../shared/constants';

export const irohCmd: Command = {
  data: new SlashCommandBuilder().setName('iroh').setDescription('Have a chat with Uncle Iroh'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const greeting = getGreeting();

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setAuthor({ name: 'Uncle Iroh', iconURL: interaction.client.user.displayAvatarURL() })
      .setDescription(greeting)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
