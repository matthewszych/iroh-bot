import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import * as db from '../db';
import { Command } from '../shared/constants';

export const chooseElementCmd: Command = {
  data: new SlashCommandBuilder().setName('choose-element').setDescription('Choose your bending element'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    await db.createUser(userId, guildId);

    const select = new StringSelectMenuBuilder()
      .setCustomId('element_select')
      .setPlaceholder('Choose your element...')
      .addOptions(
        { label: 'Fire Nation', description: 'The element of power, desire, and will', emoji: '🔥', value: 'fire' },
        { label: 'Water Tribe', description: 'The element of change and adaptability', emoji: '🌊', value: 'water' },
        { label: 'Earth Kingdom', description: 'The element of substance and strength', emoji: '🪨', value: 'earth' },
        { label: 'Air Nomads', description: 'The element of freedom and peace', emoji: '💨', value: 'air' },
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle('Choose Your Element')
      .setDescription(
        'Ah, a most important decision! Each element reflects a part of your spirit.\n\n' +
          '🔥 **Fire** — Power, drive, and passion\n' +
          '🌊 **Water** — Adaptability, flow, and healing\n' +
          '🪨 **Earth** — Strength, endurance, and stability\n' +
          '💨 **Air** — Freedom, peace, and detachment\n\n' +
          '*Choose wisely, young one. But remember — there is no wrong path, only different journeys.*',
      )
      .setFooter({ text: 'Uncle Iroh' });

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
