import { describe, it, expect } from 'vitest';
import { Element, ELEMENT_INFO } from '../src/shared/constants';

describe('ELEMENT_INFO', () => {
  const elements: Element[] = ['fire', 'water', 'earth', 'air'];

  it('has all four elements', () => {
    elements.forEach((el) => {
      expect(ELEMENT_INFO[el]).toBeDefined();
    });
  });

  it('each element has required fields', () => {
    elements.forEach((el) => {
      const info = ELEMENT_INFO[el];
      expect(typeof info.color).toBe('number');
      expect(typeof info.emoji).toBe('string');
      expect(typeof info.name).toBe('string');
      expect(info.emoji.length).toBeGreaterThan(0);
      expect(info.name.length).toBeGreaterThan(0);
    });
  });

  it('has correct element names', () => {
    expect(ELEMENT_INFO.fire.name).toBe('Fire Nation');
    expect(ELEMENT_INFO.water.name).toBe('Water Tribe');
    expect(ELEMENT_INFO.earth.name).toBe('Earth Kingdom');
    expect(ELEMENT_INFO.air.name).toBe('Air Nomads');
  });
});
