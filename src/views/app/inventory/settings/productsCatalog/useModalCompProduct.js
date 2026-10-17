import { useEffect, useMemo, useRef, useState } from "react";
import { IntlMessages, validInt } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import { useForm } from "@Hooks";
import { useProductOptions } from "./useProductOptions";
import { withSelectedOption } from "./pagingRules";
import {
  emptyComponentForm, mapComponentToForm, validateComponent, buildComponentPayload, componentOptions, unitOptions
} from "./compoundRules";

const componentsUrl = (fatherId) => `inventory/settings/products/${fatherId}/components`;
const DISTRIBUTIONS_URL = 'inventory/settings/productsDistributions';

// Componentes del producto compuesto (SPEC v2-11-sr). `fatherId` y `fatherCode` son el id y el código del producto compuesto.
// Las reglas son las del back (compoundRules.js): aquí solo se evita llamar al back con lo que ya se sabe rechazado; los
// rechazos del back (ciclo, duplicado, unidad, ...) los muestra `request` con su mensaje real.
export const useModalCompProduct = ({ setLoading, fatherId, fatherCode }) => {

  const [components, setComponents] = useState([]);
  // Combo de componentes con búsqueda en el servidor (SPEC v2-18-sr): ya no se pide el catálogo completo al abrir.
  const { options: products, onInputChange: onProductSearch } = useProductOptions();
  const [units, setUnits] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const lastUnitsRequest = useRef(0);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm(emptyComponentForm());
  const { id } = formState;
  const isEdit = validInt(id) > 0;

  // Errores por campo (mismas reglas que el back) y su forma `<campo>Valid`, como el resto de los modales.
  const errors = useMemo(() => validateComponent(formState, { fatherCode, isEdit }), [formState, fatherCode, isEdit]);
  const formValidation = useMemo(() => ({
    productCodeValid: errors.productCode || null,
    unitedOutValid: errors.unitedOut || null,
    qtyValid: errors.qty || null
  }), [errors]);

  // Combo de componentes: en el alta no ofrece al padre ni a los que ya son componentes; al editar, el producto es fijo y
  // tiene que seguir apareciendo en la lista.
  const productOptions = useMemo(() => {
    const options = componentOptions(products, {
      fatherCode,
      existingCodes: isEdit ? [] : components.map((c) => c.productCode)
    });
    // El producto elegido (o el que se edita) sigue apareciendo aunque la búsqueda actual no lo traiga.
    const known = components.map((c) => ({ value: c.productCode, label: `${c.productCode} - ${c.productName}` }));
    return withSelectedOption(options, formState.productCode, known);
  }, [products, components, fatherCode, isEdit, formState.productCode]);

  const fnGetComponents = () => {
    setLoading(true);
    request.GET(componentsUrl(fatherId), (res) => {
      setComponents(res?.data || []);
      setLoading(false);
    }, () => {
      setComponents([]);
      setLoading(false);
    });
  };

  // Unidades de salida = distribuciones ACTIVAS del componente elegido. Una respuesta tardía de otro producto no pisa a la última.
  const fnGetUnits = (productCode, { autoSelect = false } = {}) => {
    const requestId = lastUnitsRequest.current + 1;
    lastUnitsRequest.current = requestId;
    if (!productCode) {
      setUnits([]);
      return;
    }
    request.GET(buildUrl(DISTRIBUTIONS_URL, { productCode }), (res) => {
      if (lastUnitsRequest.current !== requestId) return;
      const options = unitOptions(res?.data || []);
      setUnits(options);
      if (autoSelect && options.length === 1) setBulkForm({ unitedOut: options[0].id });
    }, () => {
      if (lastUnitsRequest.current === requestId) setUnits([]);
    });
  };

  // Los combos mandan "0" al limpiar la selección: se guarda como vacío.
  const onFieldChange = (event) => {
    const { name } = event.target;
    const value = event.target.value === '0' ? '' : event.target.value;
    if (name === 'productCode') {
      setBulkForm({ productCode: value, unitedOut: '' });
      fnGetUnits(value, { autoSelect: true });
      return;
    }
    onInputChange({ target: { name, value } });
  };

  const fnEditItem = (item) => {
    setSendForm(false);
    setBulkForm(mapComponentToForm(item));
    fnGetUnits(item.productCode);
  };

  const fnReset = () => {
    setSendForm(false);
    setUnits([]);
    lastUnitsRequest.current += 1;
    onResetForm();
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildComponentPayload(formState, { isEdit });
    const onDone = () => {
      fnReset();
      fnGetComponents();
    };
    const onError = () => setLoading(false);

    setLoading(true);
    if (isEdit) {
      request.PUT(`${componentsUrl(fatherId)}/${id}`, data, onDone, onError);
    } else {
      request.POST(componentsUrl(fatherId), data, onDone, onError);
    }
  };

  const fnDelete = () => {
    const item = itemToDelete;
    setItemToDelete(null);
    if (!item) return;
    setLoading(true);
    request.DELETE(`${componentsUrl(fatherId)}/${item.id}`, () => {
      if (validInt(formState.id) === validInt(item.id)) fnReset();
      fnGetComponents();
    }, () => setLoading(false));
  };

  const table = {
    title: IntlMessages("page.productsCatalog.modal.compProduct.table.title"),
    columns: [
      {
        text: IntlMessages("page.productsCatalog.modal.compProduct.column.code"),
        dataField: "productCode",
        headerStyle: { 'width': '20%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.compProduct.column.name"),
        dataField: "productName",
        headerStyle: { 'width': '40%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.compProduct.column.unit"),
        dataField: "unitedOut",
        headerStyle: { 'width': '15%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.compProduct.column.qty"),
        dataField: "qty",
        type: 'number',
        decimals: 2,
        headerStyle: { 'width': '10%' }
      }
    ],
    data: components,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: setItemToDelete
    }]
  };

  const propsToMsgDelete = {
    open: itemToDelete !== null,
    setOpen: (open) => { if (!open) setItemToDelete(null); },
    fnOnOk: fnDelete,
    title: "alert.question.title",
    textLegend: itemToDelete ? `${itemToDelete.productCode} - ${itemToDelete.productName || ''}` : ''
  };

  useEffect(() => {
    fnGetComponents();
  }, []);

  return {
    formState,
    formValidation,
    sendForm,
    isEdit,
    productOptions,
    onProductSearch,
    units,
    onFieldChange,
    fnSave,
    fnReset,
    propsTable: table,
    propsToMsgDelete
  };
};
