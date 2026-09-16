import { describe, expect, it } from 'vitest';
import { validateStock } from '@/lib/gann/validators';

describe('stock input validation', () => {
  it('normalizes valid stock input without changing its business fields', () => {
    const result = validateStock({
      stock: ' abb ',
      referenceDateHigh: '15/08/2024',
      high: '1234.5',
      sector: 'Industrial',
      planet: 'Mars',
    });

    expect(result.issue).toBeUndefined();
    expect(result.stock).toMatchObject({
      stock: 'ABB',
      referenceDateHigh: '15/08/2024',
      high: 1234.5,
      sector: 'Industrial',
      planet: 'Mars',
    });
  });

  it.each([
    [{}, 'Missing stock name.'],
    [{ stock: '../secrets', referenceDateHigh: '15/08/2024', high: 1 }, 'Invalid stock filename characters.'],
    [{ stock: 'ABB', referenceDateHigh: '31/02/2024', high: 1 }, 'Invalid referenceDateHigh.'],
    [{ stock: 'ABB', referenceDateHigh: '15/08/2024', high: 'not-a-number' }, 'Valid referenceDateHigh and numeric high are required.'],
  ])('rejects unsafe or invalid input %#', (input, message) => {
    expect(validateStock(input).issue?.message).toBe(message);
  });

  it('rejects an excessively long stock name', () => {
    expect(validateStock({ stock: 'A'.repeat(81), referenceDateHigh: '15/08/2024', high: 1 }).issue?.message).toBe('Stock name is too long.');
  });
});
