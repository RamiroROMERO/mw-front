import { describe, it, expect } from 'vitest';
import enLang from './en_US.js';
import esLang from './es_ES.js';

describe('sincronización de locales (en_US / es_ES)', () => {
  it('ambos locales definen exactamente el mismo conjunto de claves', () => {
    const enKeys = new Set(Object.keys(enLang));
    const esKeys = new Set(Object.keys(esLang));

    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
    const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));

    expect(missingInEs, `Faltan en es_ES.js: ${missingInEs.join(', ')}`).toEqual([]);
    expect(missingInEn, `Faltan en en_US.js: ${missingInEn.join(', ')}`).toEqual([]);
  });
});
