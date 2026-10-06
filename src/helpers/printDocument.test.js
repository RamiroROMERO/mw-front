import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@Containers/ui/Notifications', () => ({ default: vi.fn() }));
vi.mock('./core', () => ({
  request: { GETPdf: vi.fn() },
  notifyError: vi.fn(),
}));

const { request, notifyError } = await import('./core');
const notification = (await import('@Containers/ui/Notifications')).default;
const { buildPrintRequest, canPrint, printDocument } = await import('./printDocument');

beforeEach(() => vi.clearAllMocks());

describe('buildPrintRequest', () => {
  it('arma la URL con el id y el sufijo por defecto', () => {
    expect(buildPrintRequest({ path: 'banks/process/transfers', id: 7 })).toEqual({ url: 'banks/process/transfers/7/print', params: undefined });
  });

  it('acepta un sufijo distinto (comprobante y cheque físico)', () => {
    expect(buildPrintRequest({ path: 'banks/process/checks', id: 7, suffix: 'print/voucher' }).url).toBe('banks/process/checks/7/print/voucher');
  });

  it('manda solo los parámetros con valor', () => {
    const { params } = buildPrintRequest({ path: 'x', id: 1, query: { mode: 'regular', city: '  ', other: null, n: 0 } });
    expect(params).toEqual({ mode: 'regular', n: 0 });
  });

  it('sin parámetros con valor no manda query', () => {
    expect(buildPrintRequest({ path: 'x', id: 1, query: { city: '' } }).params).toBeUndefined();
  });
});

describe('canPrint', () => {
  it.each([[1, true], ['12', true], [0, false], ['0', false], [-1, false], [null, false], [undefined, false], ['abc', false]])('%p → %p', (id, expected) => {
    expect(canPrint(id)).toBe(expected);
  });
});

describe('printDocument', () => {
  it('sin documento guardado avisa y no pide nada', () => {
    const setLoading = vi.fn();
    expect(printDocument({ path: 'x', id: 0, fileName: 'a.pdf', setLoading })).toBe(false);
    expect(notification).toHaveBeenCalledWith('warning', 'msg.print.saveFirst', 'alert.warning.title');
    expect(request.GETPdf).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
  });

  it('pide el PDF por GET con la URL, el nombre y la pantalla cargando', () => {
    const setLoading = vi.fn();
    expect(printDocument({ path: 'banks/process/deposits', id: 9, fileName: 'Deposito Vario.pdf', setLoading })).toBe(true);
    expect(setLoading).toHaveBeenCalledWith(true);
    const [url, params, fileName, , method] = request.GETPdf.mock.calls[0];
    expect([url, params, fileName, method]).toEqual(['banks/process/deposits/9/print', undefined, 'Deposito Vario.pdf', 'GET']);
  });

  it('al terminar quita la pantalla cargando', () => {
    const setLoading = vi.fn();
    printDocument({ path: 'x', id: 1, fileName: 'a.pdf', setLoading });
    const fnSuccess = request.GETPdf.mock.calls[0][5];
    fnSuccess(new Blob(['x']));
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it('si el back rechaza muestra su mensaje (con el genérico de impresión como respaldo) y quita la carga', () => {
    const setLoading = vi.fn();
    printDocument({ path: 'x', id: 1, fileName: 'a.pdf', setLoading });
    const fnError = request.GETPdf.mock.calls[0][3];
    const err = { statusCode: 400, messages: [{ message: 'void.cannotPrint', description: 'No se puede imprimir un Cheque Anulado' }] };
    fnError(err);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(notifyError).toHaveBeenCalledWith(err, 'msg.print.error');
  });

  it('funciona sin setLoading', () => {
    expect(() => {
      printDocument({ path: 'x', id: 1, fileName: 'a.pdf' });
      request.GETPdf.mock.calls[0][3]({});
      request.GETPdf.mock.calls[0][5](new Blob());
    }).not.toThrow();
  });
});
