import { describe, it, expect } from 'vitest';
import {
  REPORT_URL, REPORT_FILE_NAMES, isValidCalendarDate, defaultRange, validateReportRange, buildReportRequest
} from './fuelPurchaseReportRules';

const TODAY = '2026-11-13';
const ok = { dateStart: '2026-10-01', dateEnd: '2026-10-31' };
const errorsOf = (range) => validateReportRange(range, { today: TODAY });

// Lo que GETPdf termina enviando en un GET: `${url}?${new URLSearchParams(params)}`.
const queryOf = ({ url, params }) => `${url}?${new URLSearchParams(params).toString()}`;

describe('isValidCalendarDate', () => {
  it.each(['2026-01-01', '2028-02-29', '2000-02-29', '2026-12-31'])('%s es válida', (value) => {
    expect(isValidCalendarDate(value)).toBe(true);
  });

  it.each(['2026-02-30', '2026-02-29', '2100-02-29', 'abc', '2026-13-01', '2026-01-00', '2026-1-1', '01/01/2026', '', null, undefined])(
    '%p no es válida', (value) => {
      expect(isValidCalendarDate(value)).toBe(false);
    }
  );
});

describe('defaultRange', () => {
  it('del primer día del mes a hoy', () => {
    expect(defaultRange('2026-11-13')).toEqual({ dateStart: '2026-11-01', dateEnd: '2026-11-13' });
  });

  it('el primer día del mes es válido y no futuro', () => {
    expect(errorsOf(defaultRange(TODAY))).toEqual({});
  });
});

describe('validateReportRange', () => {
  it('un rango válido no tiene errores', () => {
    expect(errorsOf(ok)).toEqual({});
  });

  it('un solo día es válido', () => {
    expect(errorsOf({ dateStart: '2026-05-10', dateEnd: '2026-05-10' })).toEqual({});
  });

  it('hasta hoy es válido (límite inclusivo) y mañana no', () => {
    expect(errorsOf({ dateStart: '2026-11-01', dateEnd: TODAY })).toEqual({});
    expect(errorsOf({ dateStart: '2026-11-01', dateEnd: '2026-11-14' })).toEqual({ dateEnd: 'page.fuelPurchases.report.error.dateFuture' });
  });

  it.each([undefined, null, '', '   '])('fecha obligatoria: %p', (value) => {
    expect(errorsOf({ ...ok, dateStart: value })).toEqual({ dateStart: 'msg.required.input.date' });
    expect(errorsOf({ ...ok, dateEnd: value })).toEqual({ dateEnd: 'msg.required.input.date' });
  });

  it('sin nada marca las dos fechas', () => {
    expect(errorsOf()).toEqual({ dateStart: 'msg.required.input.date', dateEnd: 'msg.required.input.date' });
  });

  it.each(['2026-02-30', 'abc', '2026-13-01'])('fecha inválida: %s', (value) => {
    expect(errorsOf({ ...ok, dateStart: value })).toEqual({ dateStart: 'page.fuelPurchases.report.error.dateInvalid' });
    expect(errorsOf({ ...ok, dateEnd: value })).toEqual({ dateEnd: 'page.fuelPurchases.report.error.dateInvalid' });
  });

  it('una fecha futura en Desde también se rechaza', () => {
    expect(errorsOf({ dateStart: '2027-01-01', dateEnd: '2027-01-02' })).toEqual({
      dateStart: 'page.fuelPurchases.report.error.dateFuture',
      dateEnd: 'page.fuelPurchases.report.error.dateFuture'
    });
  });

  it('rango invertido: el error va en Hasta', () => {
    expect(errorsOf({ dateStart: '2026-05-11', dateEnd: '2026-05-10' })).toEqual({ dateEnd: 'page.fuelPurchases.report.error.range' });
  });

  it('un día de diferencia en el borde del rango invertido', () => {
    expect(errorsOf({ dateStart: '2026-05-10', dateEnd: '2026-05-11' })).toEqual({});
    expect(errorsOf({ dateStart: '2026-05-11', dateEnd: '2026-05-10' })).not.toEqual({});
  });

  it('el rango solo se evalúa si las dos fechas son válidas', () => {
    expect(errorsOf({ dateStart: 'abc', dateEnd: '2026-05-10' })).toEqual({ dateStart: 'page.fuelPurchases.report.error.dateInvalid' });
  });

  it('recorta espacios', () => {
    expect(errorsOf({ dateStart: ' 2026-10-01 ', dateEnd: '2026-10-31 ' })).toEqual({});
  });
});

describe('buildReportRequest', () => {
  it('PDF: los parámetros van en params, no en la URL', () => {
    const request = buildReportRequest(ok, 'pdf');
    expect(request.url).toBe(REPORT_URL);
    expect(request.url).not.toContain('?');
    expect(queryOf(request)).toBe('inventory/process/purchaseGas/report?dateStart=2026-10-01&dateEnd=2026-10-31&format=pdf');
    expect(request.fileName).toBe(REPORT_FILE_NAMES.pdf);
  });

  it('Excel pide format=xlsx y el archivo .xlsx', () => {
    const request = buildReportRequest(ok, 'xlsx');
    expect(queryOf(request)).toBe('inventory/process/purchaseGas/report?dateStart=2026-10-01&dateEnd=2026-10-31&format=xlsx');
    expect(request.fileName).toBe('Facturas de Combustible.xlsx');
  });

  it.each([undefined, null, '', 'csv', 'XLSX'])('un formato que no es xlsx (%p) cuenta como pdf', (format) => {
    expect(buildReportRequest(ok, format).params.format).toBe('pdf');
  });

  it('sin formato pide PDF', () => {
    expect(buildReportRequest(ok).params.format).toBe('pdf');
  });

  it('recorta espacios de las fechas', () => {
    expect(buildReportRequest({ dateStart: ' 2026-10-01 ', dateEnd: '2026-10-31 ' }, 'pdf').params).toMatchObject({
      dateStart: '2026-10-01', dateEnd: '2026-10-31'
    });
  });

  it('los nombres de archivo son los que fija el back', () => {
    expect(REPORT_FILE_NAMES).toEqual({ pdf: 'Facturas de Combustible.pdf', xlsx: 'Facturas de Combustible.xlsx' });
  });
});
