import { db } from './connection';

export interface FavoriteTeamRow {
  user_id: string;
  guild_id: string;
  league: string;
  team: string;
  created_at: Date;
}

export async function setFavoriteTeam(userId: string, guildId: string, league: string, team: string): Promise<void> {
  await db<FavoriteTeamRow>('favorite_teams')
    .insert({ user_id: userId, guild_id: guildId, league, team })
    .onConflict(['user_id', 'guild_id', 'league'])
    .merge({ team });
}

export async function getFavoriteTeams(userId: string, guildId: string): Promise<FavoriteTeamRow[]> {
  return db<FavoriteTeamRow>('favorite_teams').where({ user_id: userId, guild_id: guildId });
}

export async function getFavoriteTeamsByLeague(guildId: string, league: string): Promise<FavoriteTeamRow[]> {
  return db<FavoriteTeamRow>('favorite_teams').where({ guild_id: guildId, league });
}

export async function removeFavoriteTeam(userId: string, guildId: string, league: string): Promise<void> {
  await db<FavoriteTeamRow>('favorite_teams').where({ user_id: userId, guild_id: guildId, league }).delete();
}
