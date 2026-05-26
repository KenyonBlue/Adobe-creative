import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Summer Energy Campaign')).toBe('summer-energy-campaign');
  });

  it('strips special characters', () => {
    expect(slugify('UA HOVR Phantom 3!')).toBe('ua-hovr-phantom-3');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
  });
});
