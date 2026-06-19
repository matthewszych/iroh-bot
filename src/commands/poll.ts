import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const pollCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption((opt) => opt.setName('question').setDescription('The poll question').setRequired(true))
    .addStringOption((opt) => opt.setName('options').setDescription('Options separated by | (e.g. "Eagles|Cowboys|Tie")').setRequired(true)) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const optionsRaw = interaction.options.getString('options', true);
    const options = optionsRaw.split('|').map((o) => o.trim()).filter(Boolean).slice(0, 10);

    if (options.length < 2) {
      await interaction.reply({ content: 'You need at least 2 options. Separate them with `|`.', ephemeral: true });
      return;
    }

    const lines = options.map((opt, i) => `${NUMBER_EMOJIS[i]} ${opt}`);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📊 ${question}`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `Poll by ${interaction.user.username}` })
      .setTimestamp();

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await reply.react(NUMBER_EMOJIS[i]);
    }
  },
};
