// Config por cada una de las 14 variantes del submenú "Otros Reportes" del legacy
// (fac_repoventas3.sc2) implementadas en el backend
// (mw-back/modules/billing/reports/otherSalesReports/).
//
// `columns`: cada entrada es {field, label, isNumber, isDate}. `filters`: cuáles inputs
// opcionales mostrar además del rango de fechas (todas comparten fecha). `hasCurrency`:
// si el reporte respeta el toggle Lempiras/Dólares (el legacy NO lo aplica en
// "cashExpenses" ni en "dailySummary" — confirmado línea por línea contra el .sc2).
//
// `isPivot`+`pivot`: los 4 reportes que en el legacy arman columnas dinámicas por
// mes/vendedor (`ALTER TABLE ... ADD COLUMN` en loop, sin equivalente directo en JS/SQL)
// — acá el backend devuelve datos planos (GROUP BY) y `pivotBuilder.js` arma la tabla
// dinámica en el frontend. Estos NO usan `columns` (se ignora si `isPivot` es true).
import { monthYearKey, monthYearLabel, monthYearSort } from './pivotBuilder';

export const REPORT_TYPES = [
  {
    key: 'resumeByArea', label: 'page.otherSalesReports.type.resumeByArea', endpoint: 'resumeByArea',
    hasCurrency: true, filters: [],
    columns: [
      { field: 'areaName', label: 'table.column.area' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'discount', label: 'page.invoicing.input.discValue', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'detailByArea', label: 'page.otherSalesReports.type.detailByArea', endpoint: 'detailByArea',
    hasCurrency: true, filters: [],
    columns: [
      { field: 'areaName', label: 'table.column.area' },
      { field: 'productCode', label: 'page.invoicing.table.code' },
      { field: 'productName', label: 'page.invoicing.input.descriptionProd' },
      { field: 'qty', label: 'page.invoicing.input.qtyProd', isNumber: true },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'discount', label: 'page.invoicing.input.discValue', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'byCustomer', label: 'page.otherSalesReports.type.byCustomer', endpoint: 'byCustomer',
    hasCurrency: true, filters: ['customerId', 'isPartner'],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'documentCode', label: 'page.invoicing.table.doc' },
      { field: 'documentId', label: 'page.invoicing.table.number' },
      { field: 'numberCAI', label: 'page.invoicing.table.invoice' },
      { field: 'customerRtn', label: 'page.custCreditNotes.input.clientRtn' },
      { field: 'customerName', label: 'table.column.customer' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'discount', label: 'page.invoicing.input.discValue', isNumber: true },
      { field: 'taxedValue', label: 'page.invoicing.input.taxed', isNumber: true },
      { field: 'exemptValue', label: 'page.invoicing.input.exempt', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'cashExpenses', label: 'page.otherSalesReports.type.cashExpenses', endpoint: 'cashExpenses',
    hasCurrency: false, filters: [],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'rtnBenefit', label: 'page.custCreditNotes.input.clientRtn' },
      { field: 'nameBenefit', label: 'table.column.customer' },
      { field: 'description', label: 'page.custCreditNotes.input.concept' },
      { field: 'value', label: 'table.column.value', isNumber: true }
    ]
  },
  {
    key: 'byCashier', label: 'page.otherSalesReports.type.byCashier', endpoint: 'byCashier',
    hasCurrency: true, filters: ['cashierId'],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'documentCode', label: 'page.invoicing.table.doc' },
      { field: 'documentId', label: 'page.invoicing.table.number' },
      { field: 'numberCAI', label: 'page.invoicing.table.invoice' },
      { field: 'customerName', label: 'table.column.customer' },
      { field: 'cashierName', label: 'page.boxesReport.select.cashierId' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'cashSales', label: 'page.otherSalesReports.type.cashSales', endpoint: 'cashSales',
    hasCurrency: true, filters: [],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'numberCAI', label: 'page.invoicing.table.invoice' },
      { field: 'customerName', label: 'table.column.customer' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'resumeByDepartment', label: 'page.otherSalesReports.type.resumeByDepartment', endpoint: 'resumeByDepartment',
    hasCurrency: true, filters: ['isPartner'],
    columns: [
      { field: 'departmentName', label: 'page.otherSalesReports.table.department' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'byCustomerAndDepartment', label: 'page.otherSalesReports.type.byCustomerAndDepartment', endpoint: 'byCustomerAndDepartment',
    hasCurrency: true, filters: ['isPartner'],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'numberCAI', label: 'page.invoicing.table.invoice' },
      { field: 'customerName', label: 'table.column.customer' },
      { field: 'departmentName', label: 'page.otherSalesReports.table.department' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'resumeByProductType', label: 'page.otherSalesReports.type.resumeByProductType', endpoint: 'resumeByProductType',
    hasCurrency: true, filters: [],
    columns: [
      { field: 'productType', label: 'page.otherSalesReports.table.productType' },
      { field: 'qty', label: 'page.invoicing.input.qtyProd', isNumber: true },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    key: 'dailySummary', label: 'page.otherSalesReports.type.dailySummary', endpoint: 'dailySummary',
    hasCurrency: false, filters: [],
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'documentCode', label: 'page.invoicing.table.doc' },
      { field: 'qtyDocuments', label: 'page.otherSalesReports.table.qtyDocuments', isNumber: true },
      { field: 'numberMin', label: 'page.otherSalesReports.table.numberMin' },
      { field: 'numberMax', label: 'page.otherSalesReports.table.numberMax' },
      { field: 'subtotal', label: 'page.invoicing.input.subtotal', isNumber: true },
      { field: 'tax', label: 'page.invoicing.input.taxValue', isNumber: true },
      { field: 'total', label: 'table.column.total', isNumber: true }
    ]
  },
  {
    // Opción 15 del legacy: "Ventas por Vendedor y Tipo Diario" — filas = mes + tipo de
    // producto, columnas = vendedor (sin conversión de moneda en el legacy).
    key: 'salesBySellerMonthlyDetail', label: 'page.otherSalesReports.type.salesBySellerMonthlyDetail',
    endpoint: 'salesBySellerMonthlyDetail', hasCurrency: false, filters: [], isPivot: true,
    pivot: {
      rowColumns: [
        { field: 'monthLabel', label: 'Mes', valueFn: monthYearLabel },
        { field: 'typeProd', label: 'Tipo de Producto', valueFn: (row) => row.typeProd || 'Sin Clasificación' }
      ],
      colKeyFn: (row) => row.vendCode,
      colLabelFn: (row) => row.vendName,
      colSortFn: (a, b) => String(a.vendName).localeCompare(String(b.vendName)),
      valueFields: [{ field: 'total', decimals: 2 }],
      showGrandTotal: true,
      rowSortKeyFn: (row) => `${String(row.noYear * 100 + row.noMonth).padStart(6, '0')}_${row.typeProd || ''}`
    }
  },
  {
    // Opción 16: "Ventas por Tipo de Producto" — filas = tipo de producto, columnas = mes.
    // Sin conversión de moneda (el legacy tampoco la aplica en esta opción específica).
    key: 'salesByProductTypeMonthly', label: 'page.otherSalesReports.type.salesByProductTypeMonthly',
    endpoint: 'salesByProductTypeMonthly', hasCurrency: false, filters: [], isPivot: true,
    pivot: {
      rowColumns: [{ field: 'typeProd', label: 'Tipo de Producto', valueFn: (row) => row.typeProd }],
      colKeyFn: monthYearKey,
      colLabelFn: monthYearLabel,
      colSortFn: monthYearSort,
      valueFields: [{ field: 'total', decimals: 2 }],
      showGrandTotal: true
    }
  },
  {
    // Opción 17: "Ventas por Departamento Mensual" — filas = departamento, columnas = mes.
    key: 'salesByDepartmentMonthly', label: 'page.otherSalesReports.type.salesByDepartmentMonthly',
    endpoint: 'salesByDepartmentMonthly', hasCurrency: true, filters: ['isPartner'], isPivot: true,
    pivot: {
      rowColumns: [{ field: 'departmentName', label: 'Departamento', valueFn: (row) => row.departmentName }],
      colKeyFn: monthYearKey,
      colLabelFn: monthYearLabel,
      colSortFn: monthYearSort,
      valueFields: [{ field: 'total', decimals: 2 }],
      showGrandTotal: true
    }
  },
  {
    // Opción 18: "Frecuencia de Compra por Cliente" — filas = cliente, columnas = mes con
    // 2 valores (cantidad de documentos + monto). El legacy siempre normaliza a Lempiras
    // (sin selector de moneda) y ordena el resultado final por total DESC.
    key: 'purchaseFrequencyByCustomer', label: 'page.otherSalesReports.type.purchaseFrequencyByCustomer',
    endpoint: 'purchaseFrequencyByCustomer', hasCurrency: false, filters: ['isPartner'], isPivot: true,
    pivot: {
      rowColumns: [{ field: 'customerName', label: 'Cliente', valueFn: (row) => row.customerName }],
      colKeyFn: monthYearKey,
      colLabelFn: monthYearLabel,
      colSortFn: monthYearSort,
      valueFields: [
        { field: 'qty', prefix: 'Cant.', decimals: 0 },
        { field: 'total', prefix: 'Valor', decimals: 2 }
      ],
      totalField: 'total',
      showGrandTotal: true,
      sortByTotal: true
    }
  }
];
