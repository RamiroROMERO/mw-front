import { describe, expect, test } from 'vitest';
import {
  buildCashRequest, validateSummaryFlags, reportFileName, summaryColumns, normalizeCashReport, normalizeFilters, PAYMENT_COLUMNS, CLOSE_COLUMNS, REPORT_URL
} from './cashReportRules';

const form = { startDate: '2025-01-01', endDate: '2025-01-31', cashId: 0, cashierId: 0, paymentTypeId: 0, groupBy: 0 };

describe('buildCashRequest', () => {
  test('los parámetros van en params (no en la URL) con dateStart/dateEnd; sin filtros no viajan', () => {
    expect(buildCashRequest('payments', form)).toEqual({ url: `${REPORT_URL}/payments`, params: { dateStart: '2025-01-01', dateEnd: '2025-01-31' } });
  });

  test('caja, cajero y forma de pago viajan solo si son un id mayor a 0', () => {
    const { params } = buildCashRequest('payments', { ...form, cashId: 1, cashierId: '11', paymentTypeId: 6 });
    expect(params).toMatchObject({ cashId: '1', cashierId: '11', paymentTypeId: '6' });
    expect(buildCashRequest('payments', { ...form, cashierId: 'LSPC' }).params.cashierId).toBeUndefined();
  });

  test('cobros: la agrupación solo viaja si es cajero o forma de pago', () => {
    expect(buildCashRequest('payments', { ...form, groupBy: 1 }).params.groupBy).toBe('cashier');
    expect(buildCashRequest('payments', { ...form, groupBy: '2' }).params.groupBy).toBe('paymentType');
    expect(buildCashRequest('payments', form).params.groupBy).toBeUndefined();
    expect(buildCashRequest('closes', { ...form, groupBy: 1 }).params.groupBy).toBeUndefined();
  });

  test('resumen: las tres casillas siempre viajan como 0 o 1', () => {
    expect(buildCashRequest('summary', { ...form, byCash: true, byPaymentType: 1 }).params).toMatchObject({ byCash: '1', byCashier: '0', byPaymentType: '1' });
  });

  test('cierres no usan la forma de pago y propinas solo las fechas', () => {
    const all = { ...form, cashId: 1, cashierId: 2, paymentTypeId: 3 };
    expect(buildCashRequest('closes', all).params).toEqual({ dateStart: '2025-01-01', dateEnd: '2025-01-31', cashId: '1', cashierId: '2' });
    expect(buildCashRequest('tips', all).params).toEqual({ dateStart: '2025-01-01', dateEnd: '2025-01-31' });
  });

  test('formato: pdf y xlsx viajan; json no', () => {
    expect(buildCashRequest('payments', form, 'xlsx').params.format).toBe('xlsx');
    expect(buildCashRequest('payments', form, 'pdf').params.format).toBe('pdf');
    expect(buildCashRequest('payments', form, 'json').params.format).toBeUndefined();
  });
});

describe('resumen', () => {
  test('exige al menos una agrupación', () => {
    expect(validateSummaryFlags({})).toHaveProperty('summary');
    expect(validateSummaryFlags({ byCashier: 1 })).toEqual({});
    expect(validateSummaryFlags({ byPaymentType: true })).toEqual({});
  });

  test('las columnas son las de las dimensiones elegidas más el total', () => {
    expect(summaryColumns({ byCash: 1, byPaymentType: 1 }).map((c) => c.field)).toEqual(['cashName', 'paymentTypeName', 'total']);
    expect(summaryColumns({ byCashier: 1 }).map((c) => c.field)).toEqual(['cashierName', 'total']);
  });
});

describe('nombres y columnas', () => {
  test('el nombre del archivo es el título del back según la ruta y la agrupación', () => {
    expect(reportFileName('payments', { groupBy: 1 }, 'pdf')).toBe('Reporte de Cobros por Cajero.pdf');
    expect(reportFileName('payments', { groupBy: 2 }, 'xlsx')).toBe('Reporte de Cobros en Caja por Forma de Pago.xlsx');
    expect(reportFileName('payments', {}, 'xlsx')).toBe('Reporte General de Cobros en Caja.xlsx');
    expect(reportFileName('closes', {}, 'pdf')).toBe('Resumen de Cierres de Caja.pdf');
    expect(reportFileName('tips', {}, 'pdf')).toBe('Reporte de Propinas.pdf');
    expect(reportFileName('summary', {}, 'xlsx')).toBe('Resumen de Cobros en Caja.xlsx');
  });

  test('los cobros traen RTN y cajero; los cierres, una fila por cierre con cobrado, gastos y neto', () => {
    expect(PAYMENT_COLUMNS.map((c) => c.field)).toEqual(expect.arrayContaining(['customerCode', 'cashierName']));
    expect(CLOSE_COLUMNS.map((c) => c.field)).toEqual(expect.arrayContaining(['collected', 'expenses', 'net', 'invoiced', 'cashValue']));
  });

  test('respuestas raras se normalizan a vacío', () => {
    expect(normalizeCashReport(null)).toEqual({ rows: [], totals: {} });
    expect(normalizeCashReport({ rows: [1], totals: { total: 2 } })).toEqual({ rows: [1], totals: { total: 2 } });
    expect(normalizeFilters(undefined)).toEqual({ cashes: [], cashiers: [], paymentTypes: [] });
    expect(normalizeFilters({ cashiers: [{ id: 5, name: 'Carolina' }] }).cashiers).toEqual([{ label: 'Carolina', value: 5 }]);
  });
});
