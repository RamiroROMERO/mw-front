import { useMemo, useState } from 'react'
import { request, buildUrl, notifyError } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import useProductOptions from '../../settings/productsCatalog/useProductOptions';
import { withSelectedOption } from '../../settings/productsCatalog/pagingRules';
import {
  CHANGE_PATH, PREVIEW_PATH, buildChangePayload, buildPreviewParams, formFromProduct, isCodeChange, isUnchanged, normalizeCode, productOption,
  summarizeResult, validateChange
} from './changeCodeRules';

const BY_CODE_PATH = 'inventory/settings/products/byCode';
const EMPTY_FORM = { newCode: '', name: '', description: '' };
const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));

// Cambio de código, nombre y descripción de un producto (SPEC v2-55-sr). Todo lo decide el back; aquí se valida por campo (sin llamar al
// back si falla), se pide la vista previa antes de confirmar y se muestra el resumen por tabla al terminar.
export const useChangeCode = ({ setLoading }) => {
  const [current, setCurrent] = useState(null); // producto elegido: { id, code, name, description }
  const [form, setForm] = useState(EMPTY_FORM);
  const [sendForm, setSendForm] = useState(false);
  const [preview, setPreview] = useState(null); // vista previa pendiente de confirmar (abre el modal)
  const [openConfirm, setOpenConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const { options, onInputChange: onProductSearch } = useProductOptions();

  const fieldErrors = useMemo(() => validateChange(form, current), [form, current]);
  const formValidation = toFormValidation(fieldErrors);
  const productOptions = useMemo(() => withSelectedOption(options, current?.code, [productOption(current)].filter(Boolean)), [options, current]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setForm((state) => ({ ...state, [name]: name === 'newCode' ? value.toUpperCase() : value }));
  }

  const fnReset = () => {
    setCurrent(null);
    setForm(EMPTY_FORM);
    setSendForm(false);
    setPreview(null);
    setOpenConfirm(false);
  }

  // Elegir un producto: se carga su ficha (código, nombre y descripción actuales) y el formulario arranca con nombre y descripción actuales.
  const onProductChange = (event) => {
    const code = event.target.value;
    setResult(null);
    setSendForm(false);
    if (!code) { setCurrent(null); setForm(EMPTY_FORM); return; }
    setLoading(true);
    request.GET(`${BY_CODE_PATH}/${encodeURIComponent(code)}`, (resp) => {
      const product = resp.data;
      setCurrent({ id: product.id, code: product.code, name: product.name || '', description: product.description || '' });
      setForm(formFromProduct(product));
      setLoading(false);
    }, (err) => {
      notifyError(err, 'page.changeCode.msg.loadError');
      setLoading(false);
    });
  }

  // "Cambiar": valida por campo; con cambio de código pide la vista previa (conteo por tabla) y abre la confirmación; con solo
  // nombre o descripción confirma sin vista previa (solo toca inv_prod).
  const fnAskChange = () => {
    setSendForm(true);
    if (Object.keys(fieldErrors).length > 0) return;
    if (isUnchanged(form, current)) {
      createNotification('warning', 'page.changeCode.msg.nothingToChange', 'alert.warning.title');
      return;
    }
    if (!isCodeChange(form, current)) {
      setPreview({ nameOnly: true, newCode: current.code, references: [], totalRows: 0 });
      setOpenConfirm(true);
      return;
    }
    setLoading(true);
    request.GET(buildUrl(PREVIEW_PATH, buildPreviewParams(form, current)), (resp) => {
      setPreview({ ...resp.data, nameOnly: false });
      setOpenConfirm(true);
      setLoading(false);
    }, (err) => {
      notifyError(err, 'page.changeCode.msg.previewError'); // código existente, inválido, etc.: el mensaje real del back
      setLoading(false);
    });
  }

  // Confirmado ("Sí"): un solo PUT con el cuerpo que el back acepta. Un rechazo muestra su mensaje y el formulario conserva lo digitado.
  const fnConfirmChange = () => {
    setOpenConfirm(false);
    setLoading(true);
    request.PUT(`${CHANGE_PATH}/${current.id}`, buildChangePayload(form, current), (resp) => {
      setResult({ ...summarizeResult(resp.data), oldCode: resp.data.oldCode, newCode: resp.data.newCode, changedCode: resp.data.changedCode });
      fnReset();
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const propsToControlPanel = {
    fnNew: () => { fnReset(); setResult(null); },
    buttonsHome: [
      { title: 'page.changeCode.button.change', icon: 'bi bi-arrow-left-right', onClick: fnAskChange }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    propsToControlPanel, current, form, formValidation, sendForm, productOptions, onProductSearch, onProductChange, onInputChange,
    preview, openConfirm, setOpenConfirm, fnConfirmChange, result, newCodeNormalized: normalizeCode(form.newCode)
  }
}
