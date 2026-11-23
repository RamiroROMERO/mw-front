import { describe, expect, test } from 'vitest';
import { toCustomerOptions } from './useCustomerOptions';
import { CUSTOMERS_URL, REPORT_URL } from '../otherSalesReports/otherSalesRules';

describe('toCustomerOptions', () => {
  test('arma "RTN | nombre" con el id como valor', () => {
    expect(toCustomerOptions([{ id: 3, rtn: '0801', nomcli: 'ANA' }, { id: 4, rtn: '0802', name: 'BETO' }])).toEqual([{ value: 3, label: '0801 | ANA' }, { value: 4, label: '0802 | BETO' }]);
  });

  test('un cliente eliminado lleva su marca solo si se pide (el buscador del histórico de ventas)', () => {
    const rows = [{ id: 3, rtn: '0801', name: 'ANA', isRemoved: true }, { id: 4, rtn: '0802', name: 'BETO', isRemoved: false }];
    expect(toCustomerOptions(rows, 'Eliminado')).toEqual([{ value: 3, label: '0801 | ANA (Eliminado)' }, { value: 4, label: '0802 | BETO' }]);
    expect(toCustomerOptions(rows)[0].label).toBe('0801 | ANA');
  });

  test('sin datos no hay opciones', () => {
    expect(toCustomerOptions(undefined)).toEqual([]);
  });
});

describe('buscador de clientes del reporte', () => {
  test('es el del propio reporte (incluye inactivos y eliminados), no el combo de clientes activos', () => {
    expect(CUSTOMERS_URL).toBe(`${REPORT_URL}/customers`);
  });
});
