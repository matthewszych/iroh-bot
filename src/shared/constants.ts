import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export type Element = 'fire' | 'water' | 'earth' | 'air';

export interface ElementStyle {
  color: number;
  emoji: string;
  name: string;
}

export const ELEMENT_INFO: Record<Element, ElementStyle> = {
  fire: { color: 0xff4500, emoji: '🔥', name: 'Fire Nation' },
  water: { color: 0x1e90ff, emoji: '🌊', name: 'Water Tribe' },
  earth: { color: 0x228b22, emoji: '🪨', name: 'Earth Kingdom' },
  air: { color: 0xffd700, emoji: '💨', name: 'Air Nomads' },
};
