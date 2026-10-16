import { useEffect, useMemo, useState } from 'react'
import { IntlMessages, validInt } from "@Helpers/Utils";
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { XReactTableActionButton } from '@Components/reactTable/XReactTableActionButton';
import { calculateDistributionPrices } from './priceRules';
import {
  emptyDistributionForm, mapDistributionToForm, validateDistribution, buildDistributionPayload, pickCalculatedPrices,
  canDeleteDistribution, isDefaultRow
} from './distributionRules';

const URL = 'inventory/settings/productsDistributions';

// `product` es el formulario del catálogo (costos, tipo de cálculo de costo, impuesto y porcentajes): "Calcular Precios" lo usa.
const UseModalDistProducts = (props) => {
  const { setLoading, productCode, product } = props;

  const [sendForm, setSendForm] = useState(false);
  const [detaDist, setDetaDist] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm(emptyDistributionForm());

  // Mismas reglas que el back (distributionRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateDistribution(formState), [formState]);
  const formValidation = useMemo(() => {
    const valid = {};
    ['undoutId', 'valChange', 'localMinPrice', 'localMedPrice', 'localMaxPrice', 'localOtherPrice', 'foranMinPrice', 'foranMedPrice', 'foranMaxPrice', 'foranOtherPrice'].forEach((field) => {
      valid[`${field}Valid`] = errors[field] || null;
    });
    return valid;
  }, [errors]);

  const { id } = formState;

  const fnGetDistData = () => {
    setLoading(true);
    request.GET(buildUrl(URL, { productCode }), (res) => {
      setDetaDist(res?.data || []);
      setLoading(false);
    }, () => {
      setDetaDist([]);
      setLoading(false);
    });
  };

  const fnEditDetaItem = (item) => {
    setSendForm(false);
    setBulkForm(mapDistributionToForm(item));
  };

  const fnClearDetaItem = () => {
    setSendForm(false);
    onResetForm();
  };

  const fnSaveDetaItem = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildDistributionPayload(formState, productCode);
    const onDone = () => {
      fnGetDistData();
      setSendForm(false);
      onResetForm();
    };
    const onError = () => setLoading(false);

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST(URL, data, onDone, onError);
    } else {
      request.PUT(`${URL}/${id}`, data, onDone, onError);
    }
  };

  // "Calcular Precios": costo (según el tipo de cálculo) x cantidad base, cada precio con su propio porcentaje del producto.
  // Solo reemplaza los precios que salen mayores a 0.
  const fnCalculatePrices = () => {
    setBulkForm(pickCalculatedPrices(calculateDistributionPrices(product, formState.valChange)));
  };

  const fnConfirmDelete = (item) => {
    if (!canDeleteDistribution(item)) return;
    setItemToDelete(item);
  };

  const fnDeleteDetaItem = () => {
    const item = itemToDelete;
    setItemToDelete(null);
    if (!item || !canDeleteDistribution(item)) return;
    setLoading(true);
    request.DELETE(`${URL}/${item.id}`, () => {
      if (validInt(formState.id) === validInt(item.id)) onResetForm();
      fnGetDistData();
    }, () => setLoading(false));
  };

  const table = {
    title: IntlMessages("page.productsCatalog.modal.distProduct.table.title"),
    columns: [
      {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.measureUnit"),
        dataField: "undOutName",
        headerStyle: { 'width': '20%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.baseValue"),
        dataField: "valChange",
        type: 'number',
        decimals: 2,
        headerStyle: { 'width': '10%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.minPrice"),
        dataField: "localMinPrice",
        type: 'number',
        headerStyle: { 'width': '15%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.medPrice"),
        dataField: "localMedPrice",
        type: 'number',
        headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.maxPrice"),
        dataField: "localMaxPrice",
        type: 'number',
        headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.default"),
        dataField: "isDefault",
        type: 'boolean',
        headerStyle: { 'width': '10%' }
      }, {
        // Acciones propias: la default no muestra el botón de eliminar (ni se puede desactivar).
        id: 'distActions',
        header: ' ',
        headerStyle: { 'width': '15%' },
        cell: ({ row }) => (
          <div className="btn-group">
            <XReactTableActionButton buttonItem={{ color: 'warning', icon: 'pencil', toolTip: IntlMessages('button.edit'), onClick: fnEditDetaItem }} row={row} />
            {canDeleteDistribution(row.original) && (
              <XReactTableActionButton buttonItem={{ color: 'danger', icon: 'trash', toolTip: IntlMessages('button.delete'), onClick: fnConfirmDelete }} row={row} />
            )}
          </div>
        )
      }
    ],
    data: detaDist,
    actions: []
  };

  const propsToMsgDelete = {
    open: itemToDelete !== null,
    setOpen: (open) => { if (!open) setItemToDelete(null); },
    fnOnOk: fnDeleteDetaItem,
    title: "alert.question.title",
    textLegend: itemToDelete ? `${itemToDelete.undOutName || ''}` : ''
  };

  useEffect(() => {
    fnGetDistData();
  }, [])

  return {
    table,
    formState,
    formValidation,
    onInputChange,
    sendForm,
    isEditingDefault: isDefaultRow(formState),
    fnClearDetaItem,
    fnSaveDetaItem,
    fnCalculatePrices,
    propsToMsgDelete
  }
}

export default UseModalDistProducts;
