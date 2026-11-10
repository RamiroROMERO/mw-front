import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { validInt } from '@Helpers/Utils';
import { useOtherPurchaseAccounting } from './useOtherPurchaseAccounting';
import {
  AMOUNT_FIELDS, INITIAL_FORM, NOT_LOCKED, buildPayload, calculateTotals, dueDateFor, formFromDocument, hasPendingAccounting,
  isFieldLocked, normalizeEditLock, validateOtherPurchase
} from './otherPurchaseRules';

const OTHER_PURCHASES_URL = 'inventory/process/otherPurchases';

// Legacy inv_compras_others.sc2 ("Facturas de Costos y Gastos"): documento de gasto (isExpense=1) independiente, sin líneas de
// producto. SPEC v2-30-sr: se guarda en su propio módulo del back (un solo POST o PUT en una transacción, con el correlativo, el
// período, las cuentas bloqueadas y la auditoría). Contabilizar y Anular siguen usando las rutas de Compras (spec B).
export const useOtherPurchases = ({ setLoading }) => {

  const [listDocuments, setListDocuments] = useState([]);
  const [listTaxStatNames, setListTaxStatNames] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listWorkOrders, setListWorkOrders] = useState([]);
  const [sendForm, setSendForm] = useState(false)
  const [openSearch, setOpenSearch] = useState(false);
  const [openMsgCancelDocument, setOpenMsgCancelDocument] = useState(false);
  // Estado que calcula el back para el documento cargado: bloqueo financiero (pagos o anticipos) y estado de pago de la CxP.
  const [editLock, setEditLock] = useState(NOT_LOCKED);
  const [paymentStatus, setPaymentStatus] = useState(null);
  // Cuenta de gasto de la partida: guardar no regenera la partida, así que si la cuenta cambia queda pendiente de contabilizar.
  const [postedAccountCode, setPostedAccountCode] = useState('');
  const savedAccountCode = useRef('');

  const { formState, onInputChange, onBulkForm, onResetForm } = useForm({ ...INITIAL_FORM }, {});

  const { id, typeFp, date, pdaNumber, expenseCtaCode } = formState;

  // Validación local (mismas reglas que el DTO del back). Se muestra por campo tras intentar guardar.
  const errors = useMemo(() => validateOtherPurchase(formState), [formState]);
  const formValidation = useMemo(
    () => Object.fromEntries(Object.entries(errors).map(([field, messageId]) => [`${field}Valid`, messageId])),
    [errors]
  );

  const onAccounted = (data) => {
    onBulkForm(data);
    if (validInt(data.pdaNumber) > 0) setPostedAccountCode(savedAccountCode.current);
  };
  const { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument } = useOtherPurchaseAccounting({ setLoading, id, setBulkForm: onAccounted });

  // Subtotal y total salen de los importes (legacy fncalculatetotal) y solo se recalculan cuando el usuario cambia un importe:
  // al cargar un documento histórico se respetan los valores guardados.
  const onAmountChange = ({ target }) => {
    const { name, value } = target;
    onBulkForm({ [name]: value, ...calculateTotals({ ...formState, [name]: value }) });
  };
  const handleInputChange = (event) => (AMOUNT_FIELDS.includes(event.target.name) ? onAmountChange(event) : onInputChange(event));

  // El back exige vencimiento >= fecha en Contado y Crédito; en un documento nuevo de Contado es la fecha del documento.
  useEffect(() => {
    const dateOut = dueDateFor({ id, typeFp, date, dateOut: formState.dateOut });
    if (dateOut !== formState.dateOut) onBulkForm({ dateOut });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, typeFp, date]);

  const locked = (field) => isFieldLocked(editLock, field);
  const pendingAccounting = hasPendingAccounting({ pdaNumber, expenseCtaCode, postedAccountCode });

  const fnNewDocument = () => {
    setSendForm(false);
    setEditLock(NOT_LOCKED);
    setPaymentStatus(null);
    setPostedAccountCode('');
    savedAccountCode.current = '';
    onResetForm();
  }

  // Carga el documento guardado (el listado solo trae un resumen): trae también el estado de pago y el bloqueo de edición.
  const fnLoadDocument = (row) => {
    setLoading(true);
    request.GET(`${OTHER_PURCHASES_URL}/${row.id}`, (resp) => {
      const form = formFromDocument(resp.data);
      onBulkForm(form);
      setEditLock(normalizeEditLock(resp.data?.editLock));
      setPaymentStatus(resp.data?.paymentStatus ?? null);
      savedAccountCode.current = form.expenseCtaCode;
      setPostedAccountCode(form.expenseCtaCode);
      setSendForm(false);
      setOpenSearch(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // El buscador (ModalSearchOtherPurchases) pide los documentos por páginas con búsqueda en el servidor.
  const fnSearchDocument = () => {
    setOpenSearch(true);
  }

  // Un solo POST o PUT: el back valida, numera, calcula la factura final y audita en una transacción.
  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = buildPayload(formState);
    setLoading(true)
    if (validInt(id) === 0) {
      request.POST(OTHER_PURCHASES_URL, payload,
        (resp) => {
          onBulkForm({ id: resp.data.id, documentId: resp.data.documentId });
          savedAccountCode.current = payload.expenseCtaCode;
          notification('success', 'msg.success.save', 'alert.success.title');
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
        true);
    } else {
      request.PUT(`${OTHER_PURCHASES_URL}/${validInt(id)}`, payload,
        () => {
          savedAccountCode.current = payload.expenseCtaCode;
          notification('success', 'msg.success.save', 'alert.success.title');
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
        true);
    }
  }

  const fnCancelDocument = () => {
    if (validInt(id) === 0) return;
    setOpenMsgCancelDocument(true);
  }

  const fnOkCancelDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${id}/cancel`, {}, () => {
      notification('success', 'msg.success.cancelPurchase', 'alert.success.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
      fnNewDocument();
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      notification('error', messageKey, 'alert.error.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
    }, false);
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnCancel: fnCancelDocument,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      },
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {

    setLoading(true);
    // Legacy getDocumentList("cur_doctos","AND use_inv = 1 AND usacai = 0"), línea 1520: solo
    // documentos que NO usan CAI nativo (el CAI de esta pantalla es opcional).
    request.GET('admin/documents?status=1&useInv=1&useTaxDocument=0', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      documents.unshift({ value: '0', label: 'Seleccione' });
      setListDocuments(documents);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('admin/taxStatNames/getSL?shopping=1', (resp) => {
      const taxNames = resp.data.map((item) => ({ label: item.name, value: item.id, useCai: item.useCai }));
      setListTaxStatNames(taxNames);
    }, () => { });

    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          address: item.address,
          creditDays: item.creditDays,
          cai: item.cai,
          providerType: item.providerType
        }
      });
      providers.unshift({ value: '0', label: 'Seleccione' });
      setListProviders(providers);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET(`admin/paymentTypes`, (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          usageType: item.usageType
        }
      })
      const filterPayments = paymentMethods.filter((item) => {
        return item.usageType === 2 || item.usageType === 3
      });
      filterPayments.unshift({ value: '0', label: 'Seleccione' });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      listAccounts.unshift({ value: '0', label: 'Seleccione' });
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('accounting/process/workOrders', (resp) => {
      const workOrders = resp.data.map((item) => ({ label: item.description, value: item.id }));
      workOrders.unshift({ value: '0', label: 'Seleccione' });
      setListWorkOrders(workOrders);
    }, () => { });

  }, [])

  return {
    listDocuments,
    listTaxStatNames,
    listProviders,
    listPaymentTypes,
    listLedgerAccounts,
    listWorkOrders,
    formState,
    formValidation,
    onInputChange: handleInputChange,
    sendForm,
    propsToControlPanel,
    openSearch,
    setOpenSearch,
    fnLoadDocument,
    editLock,
    locked,
    paymentStatus,
    pendingAccounting,
    openMsgCancelDocument,
    setOpenMsgCancelDocument,
    fnOkCancelDocument,
    openMsgAccountDocument,
    setOpenMsgAccountDocument,
    fnOkAccountDocument
  }
}
