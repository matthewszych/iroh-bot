import { logger } from '../shared/logger';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

export type League = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'ufc';

const LEAGUE_PATHS: Record<League, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  ufc: 'mma/ufc',
};

const LEAGUE_EMOJI: Record<League, string> = {
  nfl: '🏈',
  nba: '🏀',
  mlb: '⚾',
  nhl: '🏒',
  ufc: '🥊',
};

export interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: string;
  startTime: string;
}

export interface StandingsEntry {
  team: string;
  wins: string;
  losses: string;
  position: number;
  division: string;
}

export function getLeagueEmoji(league: League): string {
  return LEAGUE_EMOJI[league];
}

export async function getScores(league: League): Promise<GameScore[]> {
  try {
    const res = await fetch(`${ESPN_BASE}/${LEAGUE_PATHS[league]}/scoreboard`);
    const data: any = await res.json();
    const events = data.events ?? [];

    return events.map((event: any) => {
      const competition = event.competitions?.[0];
      const home = competition?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = competition?.competitors?.find((c: any) => c.homeAway === 'away');

      return {
        homeTeam: home?.team?.abbreviation ?? 'TBD',
        awayTeam: away?.team?.abbreviation ?? 'TBD',
        homeScore: home?.score ?? '0',
        awayScore: away?.score ?? '0',
        status: event.status?.type?.shortDetail ?? 'Scheduled',
        startTime: event.date ?? '',
      };
    });
  } catch (error) {
    logger.error({ err: error, league }, 'Failed to fetch scores');
    return [];
  }
}

export async function getStandings(league: League): Promise<StandingsEntry[]> {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/v2/sports/${LEAGUE_PATHS[league]}/standings`);
    const data: any = await res.json();
    const entries: StandingsEntry[] = [];

    for (const group of data.children ?? []) {
      const division = group.name ?? '';
      for (const child of group.children ?? [group]) {
        const divName = child.name ?? division;
        for (const entry of child.standings?.entries ?? []) {
          const team = entry.team?.abbreviation ?? 'TBD';
          const stats = entry.stats ?? [];
          const wins = stats.find((s: any) => s.name === 'wins')?.displayValue ?? '0';
          const losses = stats.find((s: any) => s.name === 'losses')?.displayValue ?? '0';
          entries.push({
            team,
            wins,
            losses,
            position: entries.length + 1,
            division: divName,
          });
        }
      }
    }
    return entries;
  } catch (error) {
    logger.error({ err: error, league }, 'Failed to fetch standings');
    return [];
  }
}

export async function getSchedule(league: League, days = 7): Promise<GameScore[]> {
  try {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const dateStr = `${now.toISOString().slice(0, 10).replace(/-/g, '')}-${end.toISOString().slice(0, 10).replace(/-/g, '')}`;

    const res = await fetch(`${ESPN_BASE}/${LEAGUE_PATHS[league]}/scoreboard?dates=${dateStr}`);
    const data: any = await res.json();
    const events = data.events ?? [];

    return events
      .filter((event: any) => event.status?.type?.name === 'STATUS_SCHEDULED')
      .slice(0, 10)
      .map((event: any) => {
        const competition = event.competitions?.[0];
        const home = competition?.competitors?.find((c: any) => c.homeAway === 'home');
        const away = competition?.competitors?.find((c: any) => c.homeAway === 'away');

        return {
          homeTeam: home?.team?.abbreviation ?? 'TBD',
          awayTeam: away?.team?.abbreviation ?? 'TBD',
          homeScore: '0',
          awayScore: '0',
          status: event.status?.type?.shortDetail ?? 'Scheduled',
          startTime: event.date ?? '',
        };
      });
  } catch (error) {
    logger.error({ err: error, league }, 'Failed to fetch schedule');
    return [];
  }
}
