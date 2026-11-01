import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
  it('reads quoted fields, doubled quotes, commas and CRLF', () => {
    const text = 'a,b,c\r\n1,"two, too","say ""hi"""\r\n3,,\n';
    expect(parseCsv(text)).toEqual([
      { a: '1', b: 'two, too', c: 'say "hi"' },
      { a: '3', b: '', c: '' },
    ]);
  });

  it('keeps newlines inside quotes and skips blank lines', () => {
    expect(parseCsv('x,y\n"line1\nline2",2\n\n')).toEqual([{ x: 'line1\nline2', y: '2' }]);
  });

  it('returns nothing for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });
});
