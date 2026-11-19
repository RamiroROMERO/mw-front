// Recibos de cancelación de clientes del POS (SPEC v2-89-sr). Mismas reglas que el back: el servidor decide; esto evita ir con datos inválidos. Todo en centavos sobre el texto.
export const CANCELLATION_PATH = 'billing/process/pointSales/cancellations';

const text = (value) => String(value ?? '').trim();

// Centavos de un monto con hasta 2 decimales y mayor que 0; null si no es válido.
export const toCents = (value) => {
  const raw = text(value);
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return cents > 0 ? cents : null;
};

export const formatCents = (cents) => (Number(cents || 0) / 100).toFixed(2);

const sum = (list, key) => list.reduce((total, item) => total + (toCents(item[key]) || 0), 0);

// Totales: cobrado (formas), aplicado (documentos) y diferencia (cobrado - aplicado; negativa = faltante).
export const totals = ({ documents = [], payments = [] }) => {
  const appliedCents = sum(documents, 'valuePaid');
  const collectedCents = sum(payments, 'amount');
  return { appliedCents, collectedCents, differenceCents: collectedCents - appliedCents };
};

// Solo se mandan las formas con un monto digitado.
export const activePayments = (methods = []) => methods.filter((method) => text(method.value) !== '' && Number(method.value) !== 0)
  .map((method) => ({ paymentTypeDetailId: method.id, amount: text(method.value) }));

// Errores por campo (claves de traducción). Vacío = válido. `pending` = CxC del cliente con su saldo, para no pasar del saldo.
export const validateReceipt = ({ customerId, documentCode, documents = [], payments = [], differenceCtaCode }, { pending = [] } = {}) => {
  const errors = {};
  if (!(Number(customerId) > 0)) errors.customerId = 'page.pointSales.modal.cancellations.validation.customerRequired';
  if (text(documentCode) === '') errors.documentCode = 'msg.required.input.document';
  if (documents.length === 0) errors.documents = 'page.pointSales.modal.cancellations.validation.documentsRequired';
  else {
    const ids = new Set();
    for (const doc of documents) {
      if (ids.has(doc.id)) { errors.documents = 'page.pointSales.modal.cancellations.validation.duplicated'; break; }
      ids.add(doc.id);
      const paid = toCents(doc.valuePaid);
      const row = pending.find((item) => Number(item.id) === Number(doc.id));
      if (paid === null) { errors.documents = 'page.pointSales.modal.cancellations.validation.valueInvalid'; break; }
      if (row && paid > Math.round(Number(row.balance) * 100)) { errors.documents = 'page.pointSales.modal.unpaidBills.validation.overpaid'; break; }
    }
  }
  if (payments.length === 0) errors.payments = 'page.pointSales.modal.cancellations.validation.paymentRequired';
  else if (payments.some((payment) => toCents(payment.amount) === null)) errors.payments = 'page.pointSales.modal.cancellations.validation.valueInvalid';
  const { differenceCents } = totals({ documents, payments });
  if (differenceCents !== 0 && text(differenceCtaCode) === '') errors.differenceCtaCode = 'page.pointSales.modal.cancellations.validation.differenceAccount';
  return errors;
};

// Cuerpo del alta: caja, cajero y empresa los pone el back desde la sesión. La cuenta de la diferencia solo viaja si hay diferencia.
export const buildPayload = (form, { documents, payments }) => {
  const { differenceCents } = totals({ documents, payments });
  return {
    customerId: Number(form.customerId),
    documentCode: text(form.documentCode),
    date: text(form.date),
    reference: text(form.reference),
    description: text(form.description),
    ...(differenceCents !== 0 ? { differenceCtaCode: text(form.differenceCtaCode) } : {}),
    documents: documents.map((doc) => ({ id: doc.id, valuePaid: text(doc.valuePaid) })),
    payments
  };
};

export const canVoid = (receipt, canVoidPrivilege) => Boolean(receipt) && Boolean(canVoidPrivilege) && !receipt.isVoided && !receipt.isClosed;
