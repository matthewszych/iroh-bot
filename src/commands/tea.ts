import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';

const teas = [
  { name: 'Jasmine Dragon', desc: 'A classic. Calming, fragrant, and perfect for reflection.', emoji: '🌸' },
  { name: 'Ginseng', desc: "For energy and focus. The warrior's tea.", emoji: '⚡' },
  { name: 'White Jade', desc: 'Delicate and rare. For moments of quiet contemplation.', emoji: '🤍' },
  { name: 'Lychee', desc: 'Sweet and refreshing. A reminder that life has simple pleasures.', emoji: '🍑' },
  { name: 'Iron Goddess of Mercy (Tie Guan Yin)', desc: 'Complex and layered, like the best stories.', emoji: '🙏' },
  { name: 'Green Tea', desc: 'Simple, honest, healthy. Sometimes simplicity is best.', emoji: '🍃' },
  { name: 'Chamomile', desc: 'For when the spirit needs soothing and sleep calls.', emoji: '🌼' },
  { name: 'Oolong', desc: 'Neither fully green nor fully black. Balance in a cup.', emoji: '☯️' },
];

export const teaCmd: Command = {
  data: new SlashCommandBuilder().setName('tea').setDescription('Uncle Iroh recommends a tea for your mood'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const t = teas[Math.floor(Math.random() * teas.length)];

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle(`${t.emoji} Uncle Iroh's Tea Recommendation`)
      .setDescription(`**${t.name}**\n\n*${t.desc}*`)
      .setFooter({ text: 'The secret ingredient is love... and the right water temperature.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
