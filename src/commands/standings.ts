import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import { getStandings, getLeagueEmoji, League } from '../services/sports';

export const standingsCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('standings')
    .setDescription('Get current standings')
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
    const standings = await getStandings(league);
    const emoji = getLeagueEmoji(league);

    if (standings.length === 0) {
      await interaction.editReply(`${emoji} No standings available for ${league.toUpperCase()}.`);
      return;
    }

    const grouped = new Map<string, typeof standings>();
    for (const entry of standings) {
      const div = entry.division || 'League';
      if (!grouped.has(div)) grouped.set(div, []);
      grouped.get(div)!.push(entry);
    }

    const sections: string[] = [];
    for (const [division, teams] of grouped) {
      const lines = teams
        .slice(0, 8)
        .map((t) => `\`${t.wins}-${t.losses}\` ${t.team}`);
      sections.push(`**${division}**\n${lines.join('\n')}`);
    }

    const description = sections.slice(0, 8).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle(`${emoji} ${league.toUpperCase()} Standings`)
      .setDescription(description.slice(0, 4096))
      .setFooter({ text: 'Data from ESPN' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
