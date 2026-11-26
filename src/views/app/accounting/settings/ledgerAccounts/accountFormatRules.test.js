import { describe, expect, test } from 'vitest';
import { buildFormatPayload, mapFormatToForm, validateFormatConfig } from './accountFormatRules';

const GOOD = { format: '#####-##-###', level1: '#', level2: '###', level3: '#####', level4: '#####-##', level5: '#####-##-###', level6: '' };

describe('validateFormatConfig (mismos casos que el back)', () => {
  test('acepta la configuración real', () => {
    expect(validateFormatConfig(GOOD)).toBeNull();
    expect(validateFormatConfig({ format: '####', level1: '##', level2: '####' })).toBeNull();
  });

  test.each([
    [{ format: '' }, 'format'], [{ format: '##' }, 'format'], [{ format: 'AB-CDE' }, 'format'], [{ format: '#'.repeat(26) }, 'format'],
    [{ level1: '', level2: '', level3: '', level4: '', level5: '', level6: '' }, 'levels'],
    [{ level1: '', level2: '###' }, 'levels'], [{ level2: '#' }, 'levels'], [{ level3: '###' }, 'levels'], [{ level5: '#####-##' }, 'levels'], [{ level4: 'AB' }, 'levels']
  ])('rechaza %j', (over, problem) => {
    expect(validateFormatConfig({ ...GOOD, ...over })).toBe(problem);
  });
});

describe('mapeo', () => {
  test('el cuerpo solo lleva el formato y los 6 niveles, recortados; mapFormatToForm lee las máscaras del back', () => {
    expect(buildFormatPayload({ ...GOOD, format: ' #####-##-### ', extra: 1 })).toEqual(GOOD);
    expect(mapFormatToForm({ format: GOOD.format, levels: [1, 3], masks: { level1: '#', level2: '###' } })).toMatchObject({ format: GOOD.format, level1: '#', level2: '###', level3: '' });
    expect(mapFormatToForm(null)).toMatchObject({ format: '', level6: '' });
  });
});
