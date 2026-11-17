import { useEffect, useMemo, useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';
import createNotification from '@Containers/ui/Notifications';
import useProductOptions from '../../settings/productsCatalog/useProductOptions';
import { withSelectedOption } from '../../settings/productsCatalog/pagingRules';
import {
  ADJUST_PATH, MOVEMENTS_PATH, buildPayload, changeRow, collectEdits, summarizeResult, toRow, validateFilter, validateReason
} from './costAdjustmentRules';

const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));

// Ajuste de costos y cantidades del kardex (SPEC v2-56-sr). Todo lo decide el back; aquí se valida por campo (sin llamar al back si falla),
// se calculan los valores en pantalla igual que el back, se pide un motivo y se confirma antes de guardar.
export const useCostAdjustment = ({ setLoading }) => {
  const [listStores, setListStores] = useState([]);
  const [storeId, setStoreId] = useState(0);
  const [product, setProduct] = useState(null); // { code, name }
  const [dateFrom, setDateFrom] = useState(DateHelper.format(new Date()));
  const [dateTo, setDateTo] = useState(DateHelper.format(new Date()));
  const [rows, setRows] = useState([]);
  const [searched, setSearched] = useState(false);
  const [queried, setQueried] = useState(null); // filtro de la última consulta: el PUT usa ESTE, no lo que haya cambiado después
  const [reason, setReason] = useState('');
  const [sendFilter, setSendFilter] = useState(false);
  const [sendSave, setSendSave] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const { options, onInputChange: onProductSearch } = useProductOptions();

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  const filter = { storeId, productCode: product?.code || '', dateFrom, dateTo };
  const filterErrors = useMemo(() => validateFilter({ storeId, productCode: product?.code || '', dateFrom, dateTo }), [storeId, product, dateFrom, dateTo]);
  const filterValidation = toFormValidation(filterErrors);
  const { edited, errors: rowErrors } = useMemo(() => collectEdits(rows), [rows]);
  const reasonError = validateReason(reason);
  const productOptions = useMemo(
    () => withSelectedOption(options, product?.code, product ? [{ value: product.code, label: `${product.code} - ${product.name}` }] : []),
    [options, product]
  );

  const clearResults = () => { setRows([]); setSearched(false); setQueried(null); setResult(null); setSendSave(false); };

  const fnStoreChange = (e) => {
    setStoreId(e.target.value);
    setSendFilter(false);
    clearResults();
  }

  // Elegir un producto del Catálogo (código y nombre; ya no se usa getStocks).
  const fnProductChange = (e) => {
    const code = e.target.value;
    const option = productOptions.find((item) => item.value === code);
    setProduct(code && code !== '0' ? { code, name: option ? option.label.replace(`${code} - `, '') : '' } : null);
    setSendFilter(false);
    clearResults();
  }

  const fnSearch = () => {
    setSendFilter(true);
    if (Object.keys(filterErrors).length > 0) return;
    const asked = { ...filter };
    setLoading(true);
    request.GET(buildUrl(MOVEMENTS_PATH, asked), (resp) => {
      setRows(resp.data.rows.map(toRow));
      setSearched(true);
      setQueried(asked);
      setResult(null);
      setReason('');
      setSendSave(false);
      setLoading(false);
    }, (err) => {
      notifyError(err, 'page.costAdjustment.msg.searchError'); // más de 500 líneas, rango, etc.: el mensaje real del back
      setLoading(false);
    });
  }

  const fnRowChange = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? changeRow(row, field, value) : row)));
  }

  // "Guardar": valida las filas editadas y el motivo (sin llamar al back si falla) y pide confirmación.
  const fnAskSave = () => {
    setSendSave(true);
    if (edited.length === 0) {
      createNotification('warning', 'msg.costAdjustment.noChanges', 'alert.warning.title');
      return;
    }
    if (Object.keys(rowErrors).length > 0 || reasonError) return;
    setOpenConfirm(true);
  }

  // Confirmado ("Sí"): un solo PUT con el filtro consultado, el motivo y las filas editadas. Al terminar se recarga la consulta y se
  // muestra la existencia nueva. Un rechazo (período cerrado, sin permiso, línea no editable) muestra su mensaje real y conserva lo digitado.
  const fnConfirmSave = () => {
    setOpenConfirm(false);
    setLoading(true);
    request.PUT(ADJUST_PATH, buildPayload(queried, reason, edited), (resp) => {
      setResult(summarizeResult(resp.data));
      setReason('');
      setSendSave(false);
      request.GET(buildUrl(MOVEMENTS_PATH, queried), (again) => {
        setRows(again.data.rows.map(toRow));
        setLoading(false);
      }, () => setLoading(false));
    }, () => {
      setLoading(false);
    });
  }

  return {
    listStores, storeId, fnStoreChange, product, productOptions, onProductSearch, fnProductChange, dateFrom, setDateFrom, dateTo, setDateTo,
    filterValidation, sendFilter, rows, searched, fnSearch, fnRowChange, edited, rowErrors, reason, setReason, reasonError, sendSave,
    fnAskSave, openConfirm, setOpenConfirm, fnConfirmSave, result
  }
}
