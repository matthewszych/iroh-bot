import { db } from './connection';

export interface WisdomLogRow {
  id: number;
  user_id: string;
  guild_id: string;
  quote: string;
  timestamp: Date;
}

export async function insertWisdomLog(userId: string, guildId: string, quote: string): Promise<void> {
  await db<WisdomLogRow>('wisdom_log').insert({ user_id: userId, guild_id: guildId, quote });
}
