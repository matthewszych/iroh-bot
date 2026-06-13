import { describe, it, expect } from 'vitest';
import { getWisdom, getGreeting } from '../src/services/wisdom';

describe('getWisdom', () => {
  it('returns a string', () => {
    expect(typeof getWisdom()).toBe('string');
  });

  it('returns non-empty quote', () => {
    expect(getWisdom().length).toBeGreaterThan(0);
  });

  it('returns a quote when element is null', () => {
    expect(typeof getWisdom(null)).toBe('string');
  });

  it('returns a quote for fire element', () => {
    const quote = getWisdom('fire');
    expect(typeof quote).toBe('string');
    expect(quote.length).toBeGreaterThan(0);
  });

  it('returns a quote for water element', () => {
    expect(getWisdom('water').length).toBeGreaterThan(0);
  });

  it('returns a quote for earth element', () => {
    expect(getWisdom('earth').length).toBeGreaterThan(0);
  });

  it('returns a quote for air element', () => {
    expect(getWisdom('air').length).toBeGreaterThan(0);
  });

  it('falls back to general for unknown element', () => {
    expect(typeof getWisdom('plasma')).toBe('string');
  });
});

describe('getGreeting', () => {
  it('returns a string', () => {
    expect(typeof getGreeting()).toBe('string');
  });

  it('returns non-empty greeting', () => {
    expect(getGreeting().length).toBeGreaterThan(0);
  });
});
