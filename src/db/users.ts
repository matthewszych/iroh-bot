import { db } from './connection';

export interface UserRow {
  user_id: string;
  guild_id: string;
  element: string | null;
  xp: number;
  level: number;
  wisdom_received: number;
  created_at: Date;
}

export async function getUser(userId: string, guildId: string): Promise<UserRow | undefined> {
  return db<UserRow>('users').where({ user_id: userId, guild_id: guildId }).first();
}

export async function createUser(userId: string, guildId: string): Promise<void> {
  await db<UserRow>('users')
    .insert({ user_id: userId, guild_id: guildId })
    .onConflict(['user_id', 'guild_id'])
    .ignore();
}

export async function setElement(element: string, userId: string, guildId: string): Promise<void> {
  await db<UserRow>('users').where({ user_id: userId, guild_id: guildId }).update({ element });
}

export async function addXp(amount: number, userId: string, guildId: string): Promise<void> {
  await db<UserRow>('users').where({ user_id: userId, guild_id: guildId }).increment('xp', amount);
}

export async function setLevel(level: number, userId: string, guildId: string): Promise<void> {
  await db<UserRow>('users').where({ user_id: userId, guild_id: guildId }).update({ level });
}

export async function incrementWisdomCount(userId: string, guildId: string): Promise<void> {
  await db<UserRow>('users').where({ user_id: userId, guild_id: guildId }).increment('wisdom_received', 1);
}

export async function getLeaderboard(guildId: string): Promise<UserRow[]> {
  return db<UserRow>('users').where({ guild_id: guildId }).orderBy('xp', 'desc').limit(10);
}
