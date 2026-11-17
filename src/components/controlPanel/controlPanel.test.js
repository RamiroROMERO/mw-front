// Prueba estática: lee el código fuente. IntlMessages es un hook (useIntl); en ControlPanel los botones aparecen y desaparecen
// (fnSave, fnCancel, buttonsHome...), así que llamarlo dentro de ternarios o de map cambia el orden de hooks entre renders
// ("change in the order of Hooks", visto en Traslados, Requisiciones, Reintegros y Ajustes al contabilizar).
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');

describe('ControlPanel', () => {
  test('no usa IntlMessages (hook) en ninguna parte', () => {
    expect(source).not.toContain('IntlMessages');
  });

  test('llama a useIntl una sola vez, antes de cualquier condición', () => {
    expect(source.match(/useIntl\(\)/g)).toHaveLength(1);
    expect(source.indexOf('useIntl()')).toBeLessThan(source.indexOf('fnNew ?'));
  });
});
