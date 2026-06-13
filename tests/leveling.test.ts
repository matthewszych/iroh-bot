import { describe, it, expect } from 'vitest';
import { xpForLevel, totalXpForLevel, checkLevelUp, getLevelProgress, getRank, getLevelUpMessage } from '../src/services/leveling';

describe('xpForLevel', () => {
  it('returns correct XP for level 1', () => {
    expect(xpForLevel(1)).toBe(100);
  });

  it('returns increasing XP for higher levels', () => {
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(5));
  });

  it('uses level^1.5 formula', () => {
    expect(xpForLevel(4)).toBe(Math.floor(100 * Math.pow(4, 1.5)));
  });
});

describe('totalXpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(totalXpForLevel(1)).toBe(0);
  });

  it('returns xpForLevel(1) for level 2', () => {
    expect(totalXpForLevel(2)).toBe(xpForLevel(1));
  });

  it('sums all previous levels', () => {
    const expected = xpForLevel(1) + xpForLevel(2) + xpForLevel(3);
    expect(totalXpForLevel(4)).toBe(expected);
  });
});

describe('checkLevelUp', () => {
  it('returns null when not enough XP', () => {
    expect(checkLevelUp(1, 50)).toBeNull();
  });

  it('returns next level when XP threshold met', () => {
    const xpNeeded = xpForLevel(1);
    expect(checkLevelUp(1, xpNeeded)).toBe(2);
  });

  it('returns next level when XP exceeds threshold', () => {
    const xpNeeded = xpForLevel(1) + 50;
    expect(checkLevelUp(1, xpNeeded)).toBe(2);
  });

  it('handles higher levels correctly', () => {
    const xpAtLevel5 = totalXpForLevel(5) + xpForLevel(5);
    expect(checkLevelUp(5, xpAtLevel5)).toBe(6);
  });
});

describe('getLevelProgress', () => {
  it('returns 0 at start of level', () => {
    expect(getLevelProgress(1, 0)).toBe(0);
  });

  it('returns 50 at halfway', () => {
    const halfway = Math.floor(xpForLevel(1) / 2);
    expect(getLevelProgress(1, halfway)).toBe(50);
  });

  it('caps at 100', () => {
    expect(getLevelProgress(1, 99999)).toBe(100);
  });
});

describe('getRank', () => {
  it('returns first rank for level 1 fire', () => {
    expect(getRank('fire', 1)).toBe('Spark');
  });

  it('returns second rank for level 6 water', () => {
    expect(getRank('water', 6)).toBe('Stream Runner');
  });

  it('returns Wanderer for null element', () => {
    expect(getRank(null, 5)).toBe('Wanderer');
  });

  it('returns Wanderer for invalid element', () => {
    expect(getRank('lightning', 5)).toBe('Wanderer');
  });

  it('caps rank at max index', () => {
    const rank = getRank('earth', 100);
    expect(rank).toBe('Avatar of Earth');
  });
});

describe('getLevelUpMessage', () => {
  it('returns a string', () => {
    expect(typeof getLevelUpMessage()).toBe('string');
  });

  it('returns a non-empty message', () => {
    expect(getLevelUpMessage().length).toBeGreaterThan(0);
  });
});
