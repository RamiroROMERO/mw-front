import { describe, it, expect, beforeEach } from 'vitest';
import NotificationManager from './NotificationManager';

// El contenedor guarda la lista emitida en un estado de React: si se emite la MISMA referencia, no hay nuevo render y el
// aviso no se pinta. Cada cambio debe emitir un arreglo distinto.
describe('NotificationManager', () => {
  let emitted;
  const listener = (list) => emitted.push(list);

  beforeEach(() => {
    NotificationManager.listNotify = [];
    emitted = [];
    NotificationManager.removeChangeListener(listener);
    NotificationManager.addChangeListener(listener);
  });

  it('cada aviso nuevo emite una lista distinta de la anterior', () => {
    NotificationManager.warning('uno', 'T', 3000);
    NotificationManager.warning('dos', 'T', 3000);
    NotificationManager.success('tres', 'T', 3000);

    expect(emitted).toHaveLength(3);
    expect(emitted[0]).not.toBe(emitted[1]);
    expect(emitted[1]).not.toBe(emitted[2]);
    expect(emitted[2].map((n) => n.message)).toEqual(['uno', 'dos', 'tres']);
  });

  it('no muta la lista que ya se emitió', () => {
    NotificationManager.info('uno', 'T', 3000);
    const first = emitted[0];
    NotificationManager.info('dos', 'T', 3000);
    expect(first).toHaveLength(1);
  });

  it('un aviso con prioridad va al principio, también en una lista nueva', () => {
    NotificationManager.info('normal', 'T', 3000);
    NotificationManager.error('urgente', 'T', 3000, null, true);
    expect(emitted[1].map((n) => n.message)).toEqual(['urgente', 'normal']);
    expect(emitted[1]).not.toBe(emitted[0]);
  });

  it('quitar un aviso emite una lista nueva sin él', () => {
    NotificationManager.warning('uno', 'T', 3000);
    NotificationManager.warning('dos', 'T', 3000);
    const [one] = emitted[1];
    NotificationManager.remove(one);
    expect(emitted[2].map((n) => n.message)).toEqual(['dos']);
    expect(emitted[2]).not.toBe(emitted[1]);
  });

  it('el tipo y el tiempo se conservan', () => {
    NotificationManager.error('x', 'T', 5000);
    expect(emitted[0][0]).toMatchObject({ type: 'error', message: 'x', title: 'T', timeOut: 5000 });
  });
});
