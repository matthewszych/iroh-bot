import type { Element } from '../shared/constants';

export const XP_PER_MESSAGE = 5;
export const XP_PER_WISDOM = 10;
export const XP_COOLDOWN_MS = 60000;

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function checkLevelUp(currentLevel: number, currentXp: number): number | null {
  const xpNeeded = xpForLevel(currentLevel);
  const xpIntoLevel = currentXp - totalXpForLevel(currentLevel);
  if (xpIntoLevel >= xpNeeded) {
    return currentLevel + 1;
  }
  return null;
}

export function getLevelProgress(currentLevel: number, currentXp: number): number {
  const xpNeeded = xpForLevel(currentLevel);
  const xpIntoLevel = currentXp - totalXpForLevel(currentLevel);
  return Math.min(Math.floor((xpIntoLevel / xpNeeded) * 100), 100);
}

const ranks: Record<Element, string[]> = {
  fire: [
    'Spark',
    'Flame Dancer',
    'Fire Breather',
    'Inferno Wielder',
    'Sun Warrior',
    'Dragon of the West',
    'Avatar of Fire',
  ],
  water: [
    'Dewdrop',
    'Stream Runner',
    'Wave Rider',
    'Tidal Master',
    'Moon Spirit Blessed',
    "Ocean's Fury",
    'Avatar of Water',
  ],
  earth: [
    'Pebble',
    'Stone Shaper',
    'Boulder Crusher',
    'Seismic Striker',
    'Metal Bender',
    'Badgermole Sage',
    'Avatar of Earth',
  ],
  air: ['Breeze', 'Wind Walker', 'Gust Rider', 'Storm Chaser', 'Sky Bison Master', 'Eternal Nomad', 'Avatar of Air'],
};

export function getRank(element: string | null, level: number): string {
  if (!element || !(element in ranks)) return 'Wanderer';
  const index = Math.min(Math.floor((level - 1) / 5), ranks[element as Element].length - 1);
  return ranks[element as Element][index];
}

const levelUpMessages = [
  'You have grown stronger, like a tree whose roots dig deeper with each passing season.',
  'Excellent progress! Remember, the journey itself is the reward.',
  'I am proud of you. Each step forward is a victory worth celebrating.',
  'You remind me of a young bender I once knew... full of potential and determination.',
  'Like the lotus that blooms in muddy water, you are rising beautifully.',
  'Another milestone on your path. Shall we celebrate with some tea?',
];

export function getLevelUpMessage(): string {
  return levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
}
