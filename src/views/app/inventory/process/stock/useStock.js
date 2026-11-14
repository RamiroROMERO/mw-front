import { useEffect, useMemo, useRef, useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { useProductOptions } from '@Views/app/inventory/settings/productsCatalog/useProductOptions';
import { withSelectedOption } from '@Views/app/inventory/settings/productsCatalog/pagingRules';
import { KARDEX_PATH, EMPTY_KARDEX, todayText, validateKardexFilter, buildKardexParams, normalizeKardex, buildSummary } from './kardexRules';

// Detalle de kardex de un producto en un almacén (equivale a "Ver Detalle" de inv_kardex.sc2). Solo lectura: lo calcula el back.
// Los reportes, la impresión y el Excel del detalle son specs aparte y todavía no están en la pantalla.
export const useStock = ({ setLoading }) => {
  const [listStores, setListStores] = useState([]);
  const [kardex, setKardex] = useState({ ...EMPTY_KARDEX, rows: [] });
  const [sendForm, setSendForm] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const latestRequest = useRef(0);
  const { options: productOptions, onInputChange: onProductSearch } = useProductOptions();

  const today = useMemo(() => todayText(), []);
  const { formState, onInputChange, onBulkForm } = useForm({
    storeId: 0,
    productCode: '',
    dateStart: today,
    dateEnd: today
  });

  const errors = useMemo(() => validateKardexFilter(formState), [formState]);
  const summary = useMemo(() => buildSummary(kardex), [kardex]);
  // El valor elegido tiene que seguir en el combo aunque la búsqueda actual no lo traiga.
  const listProducts = useMemo(
    () => withSelectedOption(productOptions, formState.productCode, selectedLabel ? [selectedLabel] : []),
    [productOptions, formState.productCode, selectedLabel]
  );

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores((resp.data || []).map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  // Cambiar el almacén, el producto o las fechas deja de mostrar un detalle que ya no corresponde al filtro.
  const clearDetail = () => {
    latestRequest.current += 1; // una respuesta que esté en camino ya no se muestra
    setKardex({ ...EMPTY_KARDEX, rows: [] });
  };

  const onFilterChange = (e) => {
    clearDetail();
    onInputChange(e);
  };

  const onProductChange = (e) => {
    const value = e.target.value;
    const option = listProducts.find((item) => item.value === value);
    setSelectedLabel(option || null);
    clearDetail();
    onBulkForm({ productCode: value === '0' || value === undefined || value === null ? '' : value });
  };

  const fnViewDetail = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return; // el back vuelve a validar todo, pero así no se llama a algo ya rechazado
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    setLoading(true);
    request.GET(buildUrl(KARDEX_PATH, buildKardexParams(formState)), (resp) => {
      if (requestId !== latestRequest.current) return;
      setKardex(normalizeKardex(resp?.data));
      setLoading(false);
    }, (err) => {
      if (requestId !== latestRequest.current) return;
      setKardex({ ...EMPTY_KARDEX, rows: [] });
      setLoading(false);
      notifyError(err, 'page.stock.msg.loadError');
    });
  };

  const propsToControlPanel = {
    buttonsHome: [
      {
        title: 'button.viewDetail',
        icon: 'bi bi-search',
        onClick: fnViewDetail
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  };

  return {
    propsToControlPanel,
    formState,
    errors,
    sendForm,
    kardex,
    summary,
    listStores,
    listProducts,
    onFilterChange,
    onProductChange,
    onProductSearch
  };
};
