import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../shared/constants';
import * as db from '../db';
import { League, getLeagueEmoji } from '../services/sports';

const TEAMS: Record<string, string[]> = {
  nfl: [
    'ARI',
    'ATL',
    'BAL',
    'BUF',
    'CAR',
    'CHI',
    'CIN',
    'CLE',
    'DAL',
    'DEN',
    'DET',
    'GB',
    'HOU',
    'IND',
    'JAX',
    'KC',
    'LAC',
    'LAR',
    'LV',
    'MIA',
    'MIN',
    'NE',
    'NO',
    'NYG',
    'NYJ',
    'PHI',
    'PIT',
    'SEA',
    'SF',
    'TB',
    'TEN',
    'WSH',
  ],
  nba: [
    'ATL',
    'BOS',
    'BKN',
    'CHA',
    'CHI',
    'CLE',
    'DAL',
    'DEN',
    'DET',
    'GS',
    'HOU',
    'IND',
    'LAC',
    'LAL',
    'MEM',
    'MIA',
    'MIL',
    'MIN',
    'NO',
    'NY',
    'OKC',
    'ORL',
    'PHI',
    'PHX',
    'POR',
    'SAC',
    'SA',
    'TOR',
    'UTA',
    'WAS',
  ],
  mlb: [
    'ARI',
    'ATL',
    'BAL',
    'BOS',
    'CHC',
    'CHW',
    'CIN',
    'CLE',
    'COL',
    'DET',
    'HOU',
    'KC',
    'LAA',
    'LAD',
    'MIA',
    'MIL',
    'MIN',
    'NYM',
    'NYY',
    'OAK',
    'PHI',
    'PIT',
    'SD',
    'SEA',
    'SF',
    'STL',
    'TB',
    'TEX',
    'TOR',
    'WSH',
  ],
  nhl: [
    'ANA',
    'ARI',
    'BOS',
    'BUF',
    'CAR',
    'CBJ',
    'CGY',
    'CHI',
    'COL',
    'DAL',
    'DET',
    'EDM',
    'FLA',
    'LA',
    'MIN',
    'MTL',
    'NJ',
    'NSH',
    'NYI',
    'NYR',
    'OTT',
    'PHI',
    'PIT',
    'SEA',
    'SJ',
    'STL',
    'TB',
    'TOR',
    'VAN',
    'VGK',
    'WPG',
    'WSH',
  ],
};

export const favteamCmd: Command = {
  data: new SlashCommandBuilder()
    .setName('favteam')
    .setDescription('Set or view your favorite team')
    .addStringOption((opt) =>
      opt
        .setName('league')
        .setDescription('Which league')
        .addChoices(
          { name: 'NFL', value: 'nfl' },
          { name: 'NBA', value: 'nba' },
          { name: 'MLB', value: 'mlb' },
          { name: 'NHL', value: 'nhl' },
        ),
    )
    .addStringOption((opt) =>
      opt.setName('team').setDescription('Team abbreviation (e.g. PHI, NYY, LAL)'),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const league = interaction.options.getString('league') as League | null;
    const team = interaction.options.getString('team')?.toUpperCase();

    if (!league && !team) {
      const favs = await db.getFavoriteTeams(interaction.user.id, interaction.guildId!);
      if (favs.length === 0) {
        await interaction.reply({
          content: 'You have no favorite teams set. Use `/favteam <league> <team>` to set one.',
          ephemeral: true,
        });
        return;
      }

      const lines = favs.map((f) => `${getLeagueEmoji(f.league as League)} ${f.league.toUpperCase()}: **${f.team}**`);
      const embed = new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('⭐ Your Favorite Teams')
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'Use /favteam <league> <team> to update' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!league || !team) {
      await interaction.reply({
        content: 'Please provide both a league and team. Example: `/favteam nfl PHI`',
        ephemeral: true,
      });
      return;
    }

    const validTeams = TEAMS[league];
    if (!validTeams?.includes(team)) {
      await interaction.reply({
        content: `Invalid team for ${league.toUpperCase()}. Valid teams:\n\`${validTeams?.join(', ')}\``,
        ephemeral: true,
      });
      return;
    }

    await db.setFavoriteTeam(interaction.user.id, interaction.guildId!, league, team);
    const emoji = getLeagueEmoji(league);
    await interaction.reply({
      content: `${emoji} Set your favorite ${league.toUpperCase()} team to **${team}**!`,
      ephemeral: true,
    });
  },
};
