// Autocompletado de los datos de transferencia de la Solicitud de Cheque con las cuentas bancarias del proveedor
// (SPEC v2-19). Helper puro, sin dependencias, con tests.

export const ACCOUNT_TYPES = [
  { value: '', label: '' },
  { value: 'Cuenta de Ahorro', label: 'Cuenta de Ahorro' },
  { value: 'Cuenta de Cheques', label: 'Cuenta de Cheques' },
  { value: 'Cuenta de Ahorro en Dolares', label: 'Cuenta de Ahorro en Dolares' },
  { value: 'Cuenta de Cheques en Dolares', label: 'Cuenta de Cheques en Dolares' }
];

// Cuenta del proveedor -> campos del formulario. El tipo de cuenta solo se copia si coincide con una opción del combo.
export const mapAccountToForm = (account) => ({
  bankName: account.bankName || '',
  accountType: ACCOUNT_TYPES.some((option) => option.value && option.value === account.accountType) ? account.accountType : '',
  bankAccount: account.bankAccount || '',
  beneficiaryAccountName: account.beneficiaryAccountName || '',
  beneficiaryRtn: account.beneficiaryRtn || '',
  beneficiaryEmail: account.beneficiaryEmail || ''
});

// Solo se autocompleta una solicitud NUEVA de transferencia con proveedor elegido.
export const shouldAutofill = ({ requestId, typeId, providerId }) => !(Number(requestId) > 0) && Number(typeId) > 2 && Number(providerId) > 0;

// Una cuenta: rellena directo. Varias: hay que elegir. Ninguna: no se toca nada.
export const decideAutofill = (accounts) => {
  const list = Array.isArray(accounts) ? accounts : [];
  if (list.length === 0) return { mode: 'none', fill: null };
  if (list.length === 1) return { mode: 'single', fill: mapAccountToForm(list[0]) };
  return { mode: 'multiple', fill: null };
};

export const accountOptions = (accounts) => [
  { value: '', label: '' },
  ...(accounts || []).map((account) => ({ value: String(account.id), label: [account.bankName, account.bankAccount].filter(Boolean).join(' - ') }))
];

// Marca que la próxima actualización de `providerId` viene de cargar una solicitud guardada y no debe autocompletar
// (mismo patrón que transferValueSync de Transferencias).
export const createLoadGuard = () => {
  let loaded = false;
  return {
    markLoaded: () => { loaded = true; },
    consume: () => {
      const wasLoaded = loaded;
      loaded = false;
      return wasLoaded;
    }
  };
};
