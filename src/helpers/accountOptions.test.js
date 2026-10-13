import { describe, it, expect } from 'vitest';
import { buildAccountOption, LOCK_MARK } from './accountOptions';

const free = { cta: '6010101001', nombre: 'Consumibles', blocked: false };
const blocked = { cta: '6010123002', nombre: 'Honorarios', blocked: true };

describe('buildAccountOption', () => {
  it('una cuenta libre: etiqueta normal, habilitada', () => {
    expect(buildAccountOption(free, { allowed: false })).toEqual({
      label: '6010101001 - Consumibles', value: '6010101001', blocked: false, isDisabled: false
    });
  });

  it('una cuenta bloqueada: con candado y deshabilitada', () => {
    const option = buildAccountOption(blocked, { allowed: false });
    expect(option).toMatchObject({ value: '6010123002', blocked: true, isDisabled: true });
    expect(option.label).toBe(`${LOCK_MARK} 6010123002 - Honorarios`);
  });

  it('con el privilegio 11.01.023 la bloqueada se puede elegir, pero sigue marcada', () => {
    const option = buildAccountOption(blocked, { allowed: true });
    expect(option.isDisabled).toBe(false);
    expect(option.blocked).toBe(true);
    expect(option.label.startsWith(LOCK_MARK)).toBe(true);
  });

  it('sin la bandera blocked (catálogo viejo) se trata como libre', () => {
    expect(buildAccountOption({ cta: '1', nombre: 'X' }, { allowed: false })).toMatchObject({ blocked: false, isDisabled: false });
  });
});
