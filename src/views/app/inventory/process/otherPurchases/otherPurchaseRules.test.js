import { describe, expect, test } from 'vitest';
import {
  AMOUNT_FIELDS, INITIAL_FORM, accountingAction, LOCKABLE_FIELDS, MAX, NOT_LOCKED, buildPayload, calculateTotals, dueDateFor, formFromDocument,
  hasPendingAccounting, isFieldLocked, localToday, lockReasonIds, normalizeEditLock, paymentStatusId, printOptions, PRINT_FILE_NAME,
  PRINT_PATH, validateOtherPurchase
} from './otherPurchaseRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

const TODAY = '2026-08-20';
const valid = () => ({
  documentCode: 'FCG', typeTax: 1, providerId: 114, providerType: 1, invoiceNumber: '000-001-01-00000010', paymentTypeId: 3, typeFp: 1,
  expenseCtaCode: '6010123002', description: 'Servicio', requestedBy: 'Juan', date: '2026-08-10', dateOut: '2026-08-10', cai: '',
  exemptedCertificate: '', exemptedNumber: '', exemptedRecord: '', workOrderId: 0, subtotal: 1000, discount: 0, valueExonerated: 0,
  valueExempt: 0, valueTaxable: 1000, tax: 150, freight: 0, otherCharges: 0, total: 1150
});
const check = (overrides = {}) => validateOtherPurchase({ ...valid(), ...overrides }, { today: TODAY });

describe('validateOtherPurchase: mismos casos que OtherPurchaseDTO del back', () => {
  test('un documento completo es válido; CAI, SAR, orden de trabajo y providerType opcionales', () => {
    expect(check()).toEqual({});
    const form = valid();
    ['cai', 'exemptedCertificate', 'exemptedNumber', 'exemptedRecord', 'workOrderId'].forEach((f) => delete form[f]);
    expect(validateOtherPurchase(form, { today: TODAY })).toEqual({});
  });

  test.each([
    ['documentCode', 'msg.required.select.typeDocument'], ['typeTax', 'msg.required.select.typeTax'],
    ['providerId', 'msg.required.select.provider'], ['invoiceNumber', 'msg.required.input.numInvoice'],
    ['paymentTypeId', 'msg.required.select.paymentType'], ['typeFp', 'msg.required.select.typePurchase'],
    ['expenseCtaCode', 'msg.required.select.noCtaExpense'], ['description', 'msg.required.input.description'],
    ['requestedBy', 'msg.required.input.name'], ['date', 'msg.required.input.date'], ['dateOut', 'msg.required.input.date']
  ])('%s vacío, ausente, "0" o solo espacios se rechaza con su mensaje', (field, id) => {
    const withoutField = valid();
    delete withoutField[field];
    expect(validateOtherPurchase(withoutField, { today: TODAY })[field]).toBe(id);
    ['', '   ', null].forEach((value) => expect(check({ [field]: value })[field]).toBe(id));
    if (['documentCode', 'expenseCtaCode', 'typeTax', 'providerId', 'paymentTypeId', 'typeFp'].includes(field)) {
      expect(check({ [field]: '0' })[field]).toBe(id);
    }
  });

  test.each(Object.entries(MAX))('%s: acepta %i caracteres y rechaza uno más', (field, max) => {
    expect(check({ [field]: 'x'.repeat(max) })[field]).toBeUndefined();
    expect(check({ [field]: 'x'.repeat(max + 1) })[field]).toBe('page.otherPurchases.validation.tooLong');
  });

  test('los máximos son los del back', () => {
    expect(MAX).toEqual({
      documentCode: 5, invoiceNumber: 40, cai: 50, requestedBy: 50, description: 250, expenseCtaCode: 20,
      exemptedCertificate: 100, exemptedNumber: 100, exemptedRecord: 100
    });
  });

  test('ids y tipo de pago deben ser enteros válidos', () => {
    [0, -1, 1.5, 'abc'].forEach((value) => {
      expect(check({ providerId: value }).providerId).toBeDefined();
      expect(check({ typeTax: value }).typeTax).toBeDefined();
      expect(check({ paymentTypeId: value }).paymentTypeId).toBeDefined();
    });
    [0, 3, 'x'].forEach((value) => expect(check({ typeFp: value }).typeFp).toBeDefined());
    expect(check({ typeFp: 2, dateOut: '2026-09-10' })).toEqual({});
  });

  test('fecha futura se rechaza; hoy se acepta', () => {
    expect(check({ date: '2026-08-21', dateOut: '2026-08-21' }).date).toBe('page.otherPurchases.validation.dateFuture');
    expect(check({ date: TODAY, dateOut: TODAY })).toEqual({});
  });

  test('dateOut menor que date se rechaza en Contado y Crédito; igual o mayor se acepta', () => {
    [1, 2].forEach((typeFp) => {
      expect(check({ typeFp, dateOut: '2026-08-09' }).dateOut).toBe('page.otherPurchases.validation.dateOutBeforeDate');
      expect(check({ typeFp, dateOut: '2026-08-10' })).toEqual({});
      expect(check({ typeFp, dateOut: '2026-09-10' })).toEqual({});
    });
  });

  test.each(AMOUNT_FIELDS)('%s negativo o no numérico se rechaza; vacío se acepta', (field) => {
    expect(check({ [field]: -0.01 })[field]).toBe('page.otherPurchases.validation.negative');
    expect(check({ [field]: 'abc' })[field]).toBe('page.otherPurchases.validation.negative');
    expect(check({ [field]: '' })[field]).toBeUndefined();
  });

  test('total en 0 se rechaza (también como texto) y negativo también', () => {
    expect(check({ total: 0 }).total).toBe('msg.required.input.total');
    expect(check({ total: '0.00' }).total).toBe('msg.required.input.total');
    expect(check({ total: -5 }).total).toBe('page.otherPurchases.validation.negative');
  });

  test('un formulario vacío reporta todos los obligatorios', () => {
    const errors = validateOtherPurchase({ ...INITIAL_FORM }, { today: TODAY });
    ['documentCode', 'typeTax', 'providerId', 'invoiceNumber', 'paymentTypeId', 'typeFp', 'expenseCtaCode', 'description', 'requestedBy', 'date', 'dateOut', 'total']
      .forEach((field) => expect(errors[field]).toBeDefined());
  });
});

describe('calculateTotals', () => {
  test('subtotal = exonerado + gravado + exento; total = subtotal - descuento + impuesto + flete + otros', () => {
    // 100.10 + 699.70 + 200.20 = 1000.00; 1000 - 50 + 105 + 20 + 5.5 = 1080.50
    expect(calculateTotals({ valueExonerated: 100.1, valueTaxable: 699.7, valueExempt: 200.2, discount: 50, tax: 105, freight: 20, otherCharges: 5.5 }))
      .toEqual({ subtotal: 1000, total: 1080.5 });
  });

  test('sin ruido de coma flotante (0.1 + 0.2)', () => {
    expect(calculateTotals({ valueTaxable: 0.1, valueExempt: 0.2 })).toEqual({ subtotal: 0.3, total: 0.3 });
  });

  test('textos vacíos o no numéricos cuentan como 0', () => {
    expect(calculateTotals({ valueTaxable: '', valueExempt: 'x', tax: undefined })).toEqual({ subtotal: 0, total: 0 });
  });

  test('coincide con la regla del back (tolerancia 0.01): el total calculado nunca difiere del esperado', () => {
    const form = { valueExonerated: 0, valueTaxable: 878.26, valueExempt: 0, discount: 0.26, tax: 131.74 };
    expect(calculateTotals(form)).toEqual({ subtotal: 878.26, total: 1009.74 });
  });
});

describe('buildPayload', () => {
  test('envía el documento completo con números y textos recortados', () => {
    const payload = buildPayload({ ...valid(), description: '  Servicio  ', providerId: '114', total: '1150.00', workOrderId: '' });
    expect(payload).toMatchObject({ description: 'Servicio', providerId: 114, total: 1150, workOrderId: 0, date: '2026-08-10', typeFp: 1 });
  });

  test('nunca envía id, documentId, pdaNumber, purchaseOrderId, status ni banderas del back', () => {
    const payload = buildPayload({ ...valid(), id: 5, documentId: 9, pdaNumber: 3, purchaseOrderId: 7, status: 1, isExpense: false, fatherId: 4 });
    ['id', 'documentId', 'pdaNumber', 'purchaseOrderId', 'status', 'isExpense', 'fatherId'].forEach((f) => expect(payload).not.toHaveProperty(f));
  });

  test('providerType por defecto es Proveedor (1) y Acreedor (2) se conserva', () => {
    expect(buildPayload({ ...valid(), providerType: 0 }).providerType).toBe(1);
    expect(buildPayload({ ...valid(), providerType: 2 }).providerType).toBe(2);
  });

  test('la fecha vacía de MySQL se envía vacía', () => {
    expect(buildPayload({ ...valid(), dateOut: '1900-01-01' }).dateOut).toBe('');
  });
});

describe('formFromDocument', () => {
  const stored = {
    id: 5, documentCode: 'FCG', documentId: 4321, date: '2026-08-10', dateOut: '1900-01-01', providerId: 114, providerType: null,
    invoiceNumber: 'F-1', cai: null, total: '1150.00000', subtotal: '1000.00000', tax: '150.00000', description: 'x', pdaNumber: '100028205',
    providerData: { id: 114, name: 'ACME' }, paymentStatus: 'paid', editLock: {}
  };

  test('nulos y ausentes toman el valor inicial; decimales de MySQL pasan a número; fecha vacía queda vacía', () => {
    const form = formFromDocument(stored);
    expect(form).toMatchObject({ id: 5, documentId: 4321, total: 1150, subtotal: 1000, tax: 150, cai: '', dateOut: '', providerType: 1, pdaNumber: 100028205, freight: 0 });
    Object.values(form).forEach((value) => expect(value).not.toBeNull());
    Object.values(form).forEach((value) => expect(value).not.toBeUndefined());
  });

  test('solo conserva campos del formulario (no providerData, paymentStatus ni editLock)', () => {
    const form = formFromDocument(stored);
    ['providerData', 'paymentStatus', 'editLock'].forEach((f) => expect(form).not.toHaveProperty(f));
    expect(Object.keys(form).sort()).toEqual(Object.keys(INITIAL_FORM).sort());
  });

  test('un documento sin datos devuelve el formulario inicial', () => {
    expect(formFromDocument()).toEqual(INITIAL_FORM);
  });
});

describe('editLock', () => {
  test('normalizeEditLock: solo financial === true bloquea; cualquier cosa rara no bloquea', () => {
    expect(normalizeEditLock({ financial: true, reasons: ['advances', 'payments', 'otra'] })).toEqual({ financial: true, reasons: ['payments', 'advances'] });
    [null, undefined, 'x', [], { financial: 'true' }, { financial: 1 }].forEach((value) => {
      expect(normalizeEditLock(value).financial).toBe(false);
    });
    expect(normalizeEditLock(null)).toBe(NOT_LOCKED);
  });

  test('isFieldLocked: solo los campos financieros y solo con el bloqueo activo', () => {
    const locked = { financial: true, reasons: ['payments'] };
    LOCKABLE_FIELDS.forEach((field) => {
      expect(isFieldLocked(locked, field)).toBe(true);
      expect(isFieldLocked(NOT_LOCKED, field)).toBe(false);
    });
    ['expenseCtaCode', 'description', 'requestedBy', 'cai', 'workOrderId', 'exemptedNumber', 'subtotal', 'total'].forEach((field) => {
      expect(isFieldLocked(locked, field)).toBe(false);
    });
  });

  test('los campos bloqueables son los del back (sin los calculados)', () => {
    expect([...LOCKABLE_FIELDS].sort()).toEqual([
      'date', 'dateOut', 'discount', 'freight', 'invoiceNumber', 'otherCharges', 'paymentTypeId', 'providerId', 'tax', 'typeFp',
      'valueExempt', 'valueExonerated', 'valueTaxable'
    ]);
  });

  test('lockReasonIds en orden fijo', () => {
    expect(lockReasonIds(['advances', 'payments'])).toEqual(['page.otherPurchases.locked.reason.payments', 'page.otherPurchases.locked.reason.advances']);
    expect(lockReasonIds([])).toEqual([]);
  });
});

describe('aviso de cambios pendientes de contabilizar', () => {
  test('con partida y otra cuenta de gasto: avisa', () => {
    expect(hasPendingAccounting({ pdaNumber: 100, expenseCtaCode: '6010123003', postedAccountCode: '6010123002' })).toBe(true);
  });

  test.each([
    [{ pdaNumber: 0, expenseCtaCode: '6010123003', postedAccountCode: '6010123002' }],
    [{ pdaNumber: 100, expenseCtaCode: '6010123002', postedAccountCode: '6010123002' }],
    [{ pdaNumber: 100, expenseCtaCode: ' 6010123002 ', postedAccountCode: '6010123002' }],
    [{ pdaNumber: 100, expenseCtaCode: '6010123003', postedAccountCode: '' }],
    [{ pdaNumber: '0', expenseCtaCode: 'a', postedAccountCode: 'b' }]
  ])('no avisa: %j', (args) => {
    expect(hasPendingAccounting(args)).toBe(false);
  });
});

describe('utilidades', () => {
  test('paymentStatusId', () => {
    expect(paymentStatusId('paid')).toBe('page.otherPurchases.paymentStatus.paid');
    expect(paymentStatusId('pending')).toBe('page.otherPurchases.paymentStatus.pending');
    expect(paymentStatusId(null)).toBeNull();
    expect(paymentStatusId('x')).toBeNull();
  });

  test('dueDateFor: en un documento nuevo de Contado el vencimiento es la fecha; en Crédito o guardado, el que haya', () => {
    expect(dueDateFor({ id: 0, typeFp: 1, date: '2026-08-10', dateOut: '2026-09-01' })).toBe('2026-08-10');
    expect(dueDateFor({ id: 0, typeFp: 2, date: '2026-08-10', dateOut: '2026-09-01' })).toBe('2026-09-01');
    expect(dueDateFor({ id: 5, typeFp: 1, date: '2026-08-10', dateOut: '2026-09-01' })).toBe('2026-09-01');
  });

  test('localToday usa el calendario local', () => {
    expect(localToday(new Date(2026, 7, 5, 23, 59))).toBe('2026-08-05');
  });
});

describe('accountingAction (SPEC v2-31-sr): qué botón y qué confirmación corresponden', () => {
  test('sin documento guardado no hay nada que contabilizar', () => {
    [{ id: 0, pdaNumber: 0 }, { id: '0' }, {}, undefined, { id: null }].forEach((args) => expect(accountingAction(args).mode).toBe('none'));
  });

  test('sin partida es la primera contabilización con el texto de siempre', () => {
    expect(accountingAction({ id: 7, pdaNumber: 0 })).toEqual({ mode: 'account', buttonId: 'button.count', confirmId: 'msg.question.accountDocument.title' });
    expect(accountingAction({ id: 7 }).mode).toBe('account');
    expect(accountingAction({ id: '7', pdaNumber: '0' }).mode).toBe('account');
  });

  test('con partida el botón se llama "Re-contabilizar" y la confirmación avisa que se regenera', () => {
    expect(accountingAction({ id: 7, pdaNumber: 321 })).toEqual({
      mode: 'reaccount', buttonId: 'page.otherPurchases.button.reaccount', confirmId: 'page.otherPurchases.msg.reaccount.title'
    });
    expect(accountingAction({ id: '7', pdaNumber: '321' }).mode).toBe('reaccount');
  });
});

describe('impresión (SPEC v2-32-sr)', () => {
  test('imprime por GET a inventory/process/otherPurchases/:id/print, sin cuerpo ni parámetros', () => {
    expect(PRINT_PATH).toBe('inventory/process/otherPurchases');
    expect(buildPrintRequest(printOptions(812))).toEqual({ url: 'inventory/process/otherPurchases/812/print', params: undefined });
  });

  test('el archivo se llama Factura de Costos y Gastos.pdf', () => {
    expect(PRINT_FILE_NAME).toBe('Factura de Costos y Gastos.pdf');
    expect(printOptions(812)).toEqual({ path: PRINT_PATH, id: 812, fileName: PRINT_FILE_NAME });
  });

  test('una factura nueva sin guardar (id 0) no se puede imprimir: avisa "guarde primero" sin llamar al back', () => {
    expect(canPrint(INITIAL_FORM.id)).toBe(false);
    expect(canPrint(0)).toBe(false);
    expect(canPrint(812)).toBe(true);
  });
});
