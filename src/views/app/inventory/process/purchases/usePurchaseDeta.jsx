import { useMemo, useState } from 'react'
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import { calculatePurchaseLine, existenceInStore, lineFromProduct, lineFromServer, validateLine } from './purchaseRules';

export const usePurchaseDeta = ({ setLoading, setPurchaseDetail }) => {

  const [openModalProducts, setOpenModalProducts] = useState(false);
  // Almacén de la compra al abrir el modal: la existencia que se muestra es la de ese almacén.
  const [productsStoreId, setProductsStoreId] = useState(0);

  const { formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
      idProd: 0,
      productCode: '',
      nameProduct: '',
      qty: 1,
      price: 0,
      subTotal: 0,
      discountPercent: 0,
      discount: 0,
      taxPercent: 0,
      taxValue: 0,
      total: 0,
      isBonus: 0,
      isExonerated: 0,
      lotCode: '',
      dateOut: '',
      nameUM: '',
      packQty: 1,
      previousCost: 0,
      currentExistence: 0
    }, {});

  // Las reglas de la línea viven en purchaseRules.js (mismas del PurchaseDetailDTO del back).
  const lineErrors = useMemo(() => validateLine(formStateDeta), [formStateDeta]);
  const formValidationDeta = useMemo(() => Object.fromEntries(Object.entries(lineErrors).map(([field, message]) => [`${field}Valid`, message])), [lineErrors]);
  const isFormValidDeta = Object.keys(lineErrors).length === 0;

  const fnGetDataDetail = (purchaseId) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseDetail', { purchaseId }), (resp) => {
      const purchaseDeta = resp.data.map(lineFromServer);
      setPurchaseDetail(purchaseDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  // El modal es el catálogo de productos (ModalViewProd): llega una fila del catálogo, no de existencias.
  const fnSelectProduct = (item) => {
    const line = lineFromProduct(item);
    setBulkFormDeta({ ...line, ...calculatePurchaseLine(line) });
    setOpenModalProducts(false);
    // La existencia del almacén se pide aparte (una sola consulta por el producto elegido).
    request.GET(`inventory/settings/products/getStock/${encodeURIComponent(item.code)}`, (resp) => {
      setBulkFormDeta({ currentExistence: existenceInStore(resp.data, productsStoreId) });
    }, () => { });
  }

  const fnViewProducts = (idStore) => {
    setProductsStoreId(idStore);
    setOpenModalProducts(true);
  }

  return {
    formStateDeta, formValidationDeta, isFormValidDeta, onInputChangeDeta, onResetFormDeta, setBulkFormDeta, fnSelectProduct, openModalProducts, setOpenModalProducts, fnViewProducts, fnGetDataDetail
  }
}
