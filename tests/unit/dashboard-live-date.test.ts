import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('dashboard live calendar', () => {
  it('hydrates with the current local date for the India calendar', () => {
    const file = readFileSync(path.resolve(process.cwd(), 'app/dashboard/page.js'), 'utf8');
    expect(file).toContain("'use client';");
    expect(file).toContain('useEffect');
    expect(file).toContain('setNow(new Date())');
  });
});
