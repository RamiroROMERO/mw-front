import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@Helpers/Utils";
import { request, buildUrl } from '@Helpers/core';
import { useProductOptions } from '@Views/app/inventory/settings/productsCatalog/useProductOptions';
import { withSelectedOption } from '@Views/app/inventory/settings/productsCatalog/pagingRules';
import { buildPageParams, countPages, DEFAULT_DEBOUNCE_MS, DEFAULT_PAGE_SIZE, describeRange, isLatestRequest, parsePage } from '@Components/modalSearch/searchRules';
import { validateStoreProduct, buildStoreProductPayload, rowToForm, findExistingAssignment, DEFAULT_LOCATION_ID } from './storesProductsRules';

const INITIAL_FORM = {
  id: 0,
  storeId: 0,
  productCode: '',
  locationId: DEFAULT_LOCATION_ID,
  stock: 0,
  qtyMin: 0,
  qtyMax: 0,
  status: true
};

export const useStoresProducts = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listLocations, setListLocations] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({ store: null, product: null });
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddLocations, setOpenModalAddLocation] = useState(false);
  const [openModalAddxLotes, setOpenModalAddxLotes] = useState(false);
  const [openModalSearchProduct, setOpenModalSearchProduct] = useState(false);
  // Tabla paginada en el servidor (1,972 filas): una página de 50 con búsqueda por código y nombre del producto.
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({ totalRecords: 0, limit: DEFAULT_PAGE_SIZE, offset: 0 });
  const latestRequest = useRef(0);

  // `productCode` es el código de texto del producto (columna codprod) y `stock` solo se muestra: lo recalcula el back
  // (updateStokManual) y nunca se envía.
  const { formState, onInputChange, onResetForm, setBulkForm } = useForm(INITIAL_FORM);

  const isEditing = formState.id > 0;

  // Mismas reglas que el back (storesProductsRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateStoreProduct(formState, { isEditing }), [formState, isEditing]);

  // Productos con búsqueda en el servidor (el combo ya no descarga el catálogo completo); el producto elegido, o el de la fila
  // que se edita, siempre aparece aunque la búsqueda actual no lo traiga.
  const { options: productSearchOptions, onInputChange: onProductSearch } = useProductOptions();
  const listProducts = useMemo(() => {
    const known = selectedLabels.product ? [{ value: formState.productCode, label: selectedLabels.product }] : [];
    return withSelectedOption(productSearchOptions, formState.productCode, known);
  }, [productSearchOptions, formState.productCode, selectedLabels.product]);

  // Al editar, el almacén puede haber dejado de ser elegible (inactivo): se conserva visible para no mostrar el combo vacío.
  const warehouseOptions = useMemo(() => {
    const id = formState.storeId;
    if (!id || listWarehouse.some((item) => item.value === id)) return listWarehouse;
    const label = selectedLabels.store || String(id);
    return [{ value: id, id, label, name: label }, ...listWarehouse];
  }, [listWarehouse, formState.storeId, selectedLabels.store]);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setSelectedLabels({
      store: item.storeData?.name || null,
      product: item.productData ? `${item.productCode} - ${item.productData.name}` : null
    });
    setSendForm(false);
    setBulkForm(rowToForm(item));
  }

  // F1 / botón Buscar (inv_prod_seek.sc2): solo al crear (al editar el producto está bloqueado). Al elegir un producto lo deja en el
  // combo y, si ya hay un almacén elegido y esa combinación ya existe, carga la fila para editarla (como el legacy), en vez de
  // dejar que el alta falle con "ya fue agregado".
  const fnOpenSearchProduct = () => {
    if (!isEditing) setOpenModalSearchProduct(true);
  }

  const fnSelectProduct = (product) => {
    const code = product.code;
    setSelectedLabels((prev) => ({ ...prev, product: `${code} - ${product.name}` }));
    setBulkForm({ productCode: code });
    const storeId = Number(formState.storeId) || 0;
    if (storeId <= 0) return;
    request.GET(buildUrl('inventory/settings/productsStore', { storeId, search: code, limit: 50 }), (resp) => {
      const found = findExistingAssignment(resp?.data, storeId, code);
      if (!found) return;
      fnEditItem({
        ...found,
        storeName: found.storeData ? found.storeData.name : '',
        code: found.productCode,
        nameProduct: found.productData ? found.productData.name : ''
      });
    }, () => {}, false);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  }

  const [table] = useState({
    title: IntlMessages("page.storesProducts.table.title"),
    columns: [
      {
        text: IntlMessages("page.storesProducts.table.warehouse"), dataField: "storeName", headerStyle: { 'width': '20%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("page.storesProducts.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.storesProducts.table.nameProduct"), dataField: "nameProduct", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.storesProducts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
    ],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  // Vuelve a pedir la página actual (después de guardar, eliminar, recalcular existencias o asignar por lotes).
  const fnGetData = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    latestRequest.current += 1;
    const requestId = latestRequest.current;
    setLoading(true);
    const params = buildPageParams({ search, page: currentPage, pageSize: DEFAULT_PAGE_SIZE });
    request.GET(buildUrl('inventory/settings/productsStore', params), (resp) => {
      if (!isLatestRequest(requestId, latestRequest.current)) return;
      const parsed = parsePage(resp, DEFAULT_PAGE_SIZE);
      // Se eliminó la última fila de la última página: vuelve a la anterior.
      if (parsed.rows.length === 0 && currentPage > 1) {
        setCurrentPage(countPages(parsed.pagination, DEFAULT_PAGE_SIZE));
        return;
      }
      setRows(parsed.rows.map((item) => ({
        ...item,
        storeName: item.storeData ? item.storeData.name : '',
        code: item.productCode,
        nameProduct: item.productData ? item.productData.name : ''
      })));
      setPagination(parsed.pagination);
      setLoading(false);
    }, () => {
      if (!isLatestRequest(requestId, latestRequest.current)) return;
      setRows([]);
      setLoading(false);
    });
    // setLoading viene del padre y cambia en cada render: no debe repetir la consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, currentPage, reloadKey]);

  const tableProps = useMemo(() => ({
    ...table,
    data: rows,
    options: {
      typePagination: 2,
      pageSize: DEFAULT_PAGE_SIZE,
      searchDebounceMs: DEFAULT_DEBOUNCE_MS,
      currentPage,
      totalPages: countPages(pagination, DEFAULT_PAGE_SIZE),
      setCurrentPage,
      setSearch,
      paginationSummary: describeRange(pagination, rows.length)
    }
  }), [table, rows, currentPage, pagination]);

  const fnClearInputs = () => {
    setCurrentItem({});
    setSelectedLabels({ store: null, product: null });
    onResetForm();
    setSendForm(false);
  }

  // El mensaje de éxito o de error (el real del back: duplicado, ubicación, rango, etc.) lo muestra `request`.
  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = buildStoreProductPayload(formState, { isEditing });
    setLoading(true);
    const onSuccess = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    const onError = () => setLoading(false);

    if (isEditing) {
      request.PUT(`inventory/settings/productsStore/${formState.id}`, payload, onSuccess, onError);
    } else {
      request.POST('inventory/settings/productsStore', payload, onSuccess, onError);
    }
  }

  // Eliminar borra la asignación de verdad (como el legacy) y el back lo rechaza si el producto tiene movimientos de kardex en
  // ese almacén (productStore.inUse): para sacarlo de uso sin borrarlo se desmarca "Activo".
  const fnDeleteDocument = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.DELETE(`inventory/settings/productsStore/${currentItem.id}`, () => {
        if (formState.id === currentItem.id) fnClearInputs();
        setCurrentItem({});
        fnGetData();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    // availableStores: solo almacenes tipo 1, activos y no eliminados (los únicos que el back acepta para asignar productos).
    request.GET('inventory/settings/productsStore/availableStores', (resp) => {
      const listStores = resp.data.map((item) => ({
        label: item.name,
        value: item.id,
        name: item.name,
        id: item.id,
      }));
      setListWarehouse(listStores);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    request.GET('inventory/settings/locations', (resp) => {
      const listLoc = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name
        }
      });
      setListLocations(listLoc);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }, []);

  // Legacy: botón sin etiqueta (ícono refresh) que llama CALL updateStokManual() —
  // recalcula inv_bodprod.existe desde el kardex real. El stored procedure ya existe
  // migrado en la base, solo faltaba conectarlo.
  const fnRefreshStock = () => {
    setLoading(true);
    request.POST('inventory/settings/productsStore/refreshStock', {}, () => {
      fnGetData();
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDeleteDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table: tableProps,
      propsToMsgDelete,
      formState,
      errors,
      isEditing,
      listLocations,
      listProducts,
      listWarehouse: warehouseOptions,
      openModalAddLocations,
      openModalAddxLotes,
      openModalSearchProduct,
      setOpenModalAddLocation,
      setOpenModalAddxLotes,
      setOpenModalSearchProduct,
      fnOpenSearchProduct,
      fnSelectProduct,
      setListLocations,
      fnClearInputs,
      fnGetData,
      fnSave,
      fnRefreshStock,
      onInputChange,
      onProductSearch
    }
  )
}
