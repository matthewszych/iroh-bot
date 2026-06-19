import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import { getScores, getLeagueEmoji, League } from '../services/sports';

const LEAGUES = ['nfl', 'nba', 'mlb', 'nhl'] as const;

export const scoresCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('scores')
    .setDescription("Get today's scores")
    .addStringOption((opt) =>
      opt
        .setName('league')
        .setDescription('Which league')
        .setRequired(true)
        .addChoices(
          { name: 'NFL', value: 'nfl' },
          { name: 'NBA', value: 'nba' },
          { name: 'MLB', value: 'mlb' },
          { name: 'NHL', value: 'nhl' },
          { name: 'UFC', value: 'ufc' },
        ),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const league = interaction.options.getString('league', true) as League;
    const scores = await getScores(league);
    const emoji = getLeagueEmoji(league);

    if (scores.length === 0) {
      await interaction.editReply(`${emoji} No ${league.toUpperCase()} games today.`);
      return;
    }

    const lines = scores.map((g) => {
      return `**${g.awayTeam}** ${g.awayScore} @ **${g.homeTeam}** ${g.homeScore} — ${g.status}`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle(`${emoji} ${league.toUpperCase()} Scores`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Data from ESPN' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
