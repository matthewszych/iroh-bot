import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import { getSchedule, getLeagueEmoji, getLeagueColor, League } from '../services/sports';

export const scheduleCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Get upcoming games')
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
    const games = await getSchedule(league);
    const emoji = getLeagueEmoji(league);

    if (games.length === 0) {
      await interaction.editReply(`${emoji} No upcoming ${league.toUpperCase()} games scheduled.`);
      return;
    }

    const lines = games.map((g) => {
      const date = new Date(g.startTime);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `\`${g.awayTeam.padEnd(4)} @ ${g.homeTeam.padEnd(4)}\` ${dateStr} • ${timeStr}`;
    });

    const embed = new EmbedBuilder()
      .setColor(getLeagueColor(league))
      .setTitle(`${emoji} ${league.toUpperCase()} Upcoming Games`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Data from ESPN' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
