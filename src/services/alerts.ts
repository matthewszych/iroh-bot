import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { getScores, getLeagueEmoji, League } from './sports';
import { getFavoriteTeamsByLeague } from '../db/favorite-teams';
import { logger } from '../shared/logger';

const LEAGUES: League[] = ['nfl', 'nba', 'mlb', 'nhl'];
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

const SEASON_MONTHS: Record<League, [number, number]> = {
  nfl: [8, 2],   // Aug–Feb (includes preseason)
  nba: [10, 6],  // Oct–Jun
  mlb: [2, 10],  // Feb–Oct (includes spring training)
  nhl: [9, 6],   // Sep–Jun (includes preseason)
  ufc: [1, 12],  // year-round
};

function isInSeason(league: League): boolean {
  const month = new Date().getMonth() + 1;
  const [start, end] = SEASON_MONTHS[league];
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

export function startGameAlerts(client: Client): void {
  const sportsChannelId = process.env.CHANNEL_SPORTS;
  if (!sportsChannelId) return;

  setInterval(() => checkGames(client, sportsChannelId), CHECK_INTERVAL_MS);
  logger.info('Game alerts scheduler started');
}

export function startDailyPost(client: Client): void {
  const sportsChannelId = process.env.CHANNEL_SPORTS;
  if (!sportsChannelId) return;

  scheduleDaily(8, 0, () => postDailyGames(client, sportsChannelId));
  logger.info('Daily games post scheduler started');
}

function scheduleDaily(hour: number, minute: number, fn: () => void): void {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();
  setTimeout(() => {
    fn();
    setInterval(fn, 24 * 60 * 60 * 1000);
  }, delay);
}

async function checkGames(client: Client, channelId: string): Promise<void> {
  for (const league of LEAGUES) {
    if (!isInSeason(league)) continue;
    try {
      const scores = await getScores(league);
      const upcomingSoon = scores.filter((g) => {
        const start = new Date(g.startTime);
        const diff = start.getTime() - Date.now();
        return diff > 0 && diff < CHECK_INTERVAL_MS;
      });

      if (upcomingSoon.length === 0) continue;

      const guilds = client.guilds.cache;
      for (const [guildId, guild] of guilds) {
        const favs = await getFavoriteTeamsByLeague(guildId, league);
        if (favs.length === 0) continue;

        const favTeams = new Set(favs.map((f) => f.team));
        const relevantGames = upcomingSoon.filter(
          (g) => favTeams.has(g.homeTeam) || favTeams.has(g.awayTeam),
        );

        if (relevantGames.length === 0) continue;

        const usersToNotify = favs.filter((f) =>
          relevantGames.some((g) => g.homeTeam === f.team || g.awayTeam === f.team),
        );

        for (const fav of usersToNotify) {
          try {
            const user = await client.users.fetch(fav.user_id);
            const game = relevantGames.find(
              (g) => g.homeTeam === fav.team || g.awayTeam === fav.team,
            )!;
            const emoji = getLeagueEmoji(league);
            const start = new Date(game.startTime);
            const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            await user.send(
              `${emoji} **${game.awayTeam} @ ${game.homeTeam}** starts at ${timeStr} today!`,
            );
          } catch {
            /* user has DMs disabled */
          }
        }
      }
    } catch (error) {
      logger.error({ err: error, league }, 'Game alert check failed');
    }
  }
}

async function postDailyGames(client: Client, channelId: string): Promise<void> {
  try {
    const allGames: string[] = [];

    for (const league of LEAGUES) {
      if (!isInSeason(league)) continue;
      const scores = await getScores(league);
      const todayGames = scores.filter((g) => {
        const start = new Date(g.startTime);
        const today = new Date();
        return start.toDateString() === today.toDateString();
      });

      if (todayGames.length === 0) continue;

      const emoji = getLeagueEmoji(league);
      const lines = todayGames.map((g) => {
        const start = new Date(g.startTime);
        const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `  ${g.awayTeam} @ ${g.homeTeam} — ${timeStr}`;
      });
      allGames.push(`**${emoji} ${league.toUpperCase()}**\n${lines.join('\n')}`);
    }

    if (allGames.length === 0) return;

    const channel = await client.channels.fetch(channelId) as TextChannel | null;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("📅 Today's Games")
      .setDescription(allGames.join('\n\n'))
      .setFooter({ text: 'Data from ESPN' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error({ err: error }, 'Daily games post failed');
  }
}
