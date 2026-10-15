import { describe, it, expect } from 'vitest';
import enLang from './en_US.js';
import esLang from './es_ES.js';
import validErrors from './validErrorTranslations.json';

// SPEC v2-36. `validErrorTranslations.json` es una COPIA de `utils/validErrorTranslations.json` del back
// (la fuente de verdad: allí un test falla si cualquier ValidError del back no está
// clasificado). Este test solo compara la copia con es_ES.js y en_US.js; no detecta que la copia difiera
// de la del back, así que al cambiar la del back hay que copiarla a mano (mismo contenido y orden).
//
// - translated: tienen `error.<name>` en es y en.
// - descriptionOnly: sin traducción a propósito; se muestra la `description` del back (los genéricos, los
//   que cambian de significado por documento y los que llevan montos, cuentas o números de línea).
const { translated: TRANSLATED_BACK, descriptionOnly: DESCRIPTION_ONLY_BACK } = validErrors;

// Nombres que el back NO lanza con ValidError (el test del back no los ve): los permisos del middleware
// ValidUserPermission (con traducción). Todos los ValidError del back, incluidos los de Contabilidad, Facturación e
// Inventario, están clasificados en validErrorTranslations.json.
const TRANSLATED_LOCAL = [
  'user.unauthorized', 'user.forbidden', 'user.create.forbidden', 'user.update.forbidden', 'user.delete.forbidden',
];
const DESCRIPTION_ONLY_LOCAL = [];

const TRANSLATED = [...TRANSLATED_BACK, ...TRANSLATED_LOCAL];
const NOT_TRANSLATED = [...DESCRIPTION_ONLY_BACK, ...DESCRIPTION_ONLY_LOCAL];

describe('traducciones de errores del back (error.<name>)', () => {
  it('la copia del back está en orden alfabético y sin nombres en las dos listas', () => {
    expect(TRANSLATED_BACK).toEqual([...new Set(TRANSLATED_BACK)].sort());
    expect(DESCRIPTION_ONLY_BACK).toEqual([...new Set(DESCRIPTION_ONLY_BACK)].sort());
    expect(TRANSLATED_BACK.filter((n) => DESCRIPTION_ONLY_BACK.includes(n))).toEqual([]);
  });

  it('las listas locales no repiten nombres del back', () => {
    const backNames = [...TRANSLATED_BACK, ...DESCRIPTION_ONLY_BACK];
    expect([...TRANSLATED_LOCAL, ...DESCRIPTION_ONLY_LOCAL].filter((n) => backNames.includes(n))).toEqual([]);
  });

  it.each(TRANSLATED)('error.%s existe en es y en con texto', (name) => {
    expect(typeof esLang[`error.${name}`]).toBe('string');
    expect(esLang[`error.${name}`].trim()).not.toBe('');
    expect(typeof enLang[`error.${name}`]).toBe('string');
    expect(enLang[`error.${name}`].trim()).not.toBe('');
  });

  it('el texto en inglés no es una copia del español', () => {
    const same = TRANSLATED.filter((n) => esLang[`error.${n}`] === enLang[`error.${n}`]);
    expect(same).toEqual([]);
  });

  it.each(NOT_TRANSLATED)('%s no tiene traducción, para que se muestre la description del back', (name) => {
    expect(Object.keys(esLang)).not.toContain(`error.${name}`);
    expect(Object.keys(enLang)).not.toContain(`error.${name}`);
  });

  it('no hay claves error.* que no estén en la lista', () => {
    const extra = Object.keys(esLang).filter((k) => k.startsWith('error.') && !TRANSLATED.includes(k.slice(6)));
    expect(extra).toEqual([]);
  });
});
