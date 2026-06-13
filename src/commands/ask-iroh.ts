import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { askIroh } from '../services/ai';
import { logger } from '../shared/logger';
import * as db from '../db';
import { Command, Element, ELEMENT_INFO } from '../shared/constants';

export const askIrohCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('ask-iroh')
    .setDescription('Ask Uncle Iroh a question and receive AI-generated wisdom')
    .addStringOption((opt) =>
      opt.setName('question').setDescription('What would you like to ask Uncle Iroh?').setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    await db.createUser(userId, guildId);
    const user = await db.getUser(userId, guildId);

    await interaction.deferReply();

    try {
      const response = await askIroh(question, user?.element);
      const info = user?.element ? ELEMENT_INFO[user.element as Element] : { color: 0x8b4513, emoji: '🍵' };

      const embed = new EmbedBuilder()
        .setColor(info.color)
        .setAuthor({ name: 'Uncle Iroh', iconURL: interaction.client.user.displayAvatarURL() })
        .setDescription(`*${response}*`)
        .setFooter({ text: `Asked: "${question.slice(0, 80)}"` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error({ err: error }, 'AI generation failed');
      await interaction.editReply({
        content:
          '*Hmm, my thoughts are clouded like a foggy mountain today. Perhaps try again later, or use `/wisdom` for a piece of my collected teachings.*',
      });
    }
  },
};
