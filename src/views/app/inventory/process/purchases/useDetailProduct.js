import { calculatePurchaseLine, EMPTY_DATE, validateLine } from './purchaseRules';

const isOn = (value) => value === true || value === 1 || value === '1';

const CLEAN_LINE = {
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
};

export const useDetailProduct = ({ idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, taxValue, total, lotCode, dateOut, isExonerated, isBonus, packQty, setBulkFormDeta, setPurchaseDetail, setSendFormDeta }) => {

  // Una línea bonificada no puede ser exonerada y al revés (Checkbox_hw4 / Checkbox_hw6 del legacy).
  const disabledIsExonerated = isOn(isBonus);
  const disabledIsBonus = isOn(isExonerated);

  // Cualquier cambio de cantidad, precio o porcentajes recalcula la línea con las mismas reglas del back.
  const recalculate = (changes) => {
    const next = { qty, price, discountPercent, taxPercent, isExonerated, ...changes };
    const values = calculatePurchaseLine(next);
    setBulkFormDeta({ ...changes, subTotal: values.subTotal, discount: values.discount, taxValue: values.taxValue, total: values.total });
  };

  const onQtyChange = e => recalculate({ qty: e.target.value });
  const onPriceChange = e => recalculate({ price: e.target.value });
  const onDiscountChange = e => recalculate({ discountPercent: e.target.value });
  const onTaxChange = e => recalculate({ taxPercent: e.target.value });

  // "Exonerado" deja el impuesto en cero (el legacy también borra el porcentaje).
  const onIsExoneratedChange = e => {
    if (e.target.checked) recalculate({ isExonerated: true, taxPercent: 0 });
    else recalculate({ isExonerated: false });
  };

  const onIsBonusChange = e => {
    setBulkFormDeta({ isBonus: e.target.checked });
  };

  const fnAddProduct = () => {
    setSendFormDeta(true);
    const form = { productCode, qty, price, discountPercent, taxPercent, lotCode, isBonus, isExonerated };
    if (Object.keys(validateLine(form)).length > 0) {
      return;
    }

    const line = {
      productCode,
      nameProduct,
      qty: Number(qty),
      price: Number(price),
      subTotal: Number(subTotal),
      discountPercent: Number(discountPercent) || 0,
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      taxValue: Number(taxValue) || 0,
      total: Number(total) || 0,
      isBonus: isOn(isBonus) ? 1 : 0,
      isExonerated: isOn(isExonerated) ? 1 : 0,
      lotCode,
      // Factor de empaque: qty y price se digitan en la unidad de entrada y se convierten a unidad base al guardar.
      packQty: Number(packQty) > 0 ? Number(packQty) : 1,
      dateOut: dateOut !== '' ? dateOut : EMPTY_DATE
    };

    if (idProd > 0) {
      // Edición: se reemplaza la línea sin mutar el estado (los totales se recalculan al cambiar `purchaseDetail`).
      setPurchaseDetail(current => current.map(item => ((item.id ? item.id : item.idTemp) === idProd ? { ...item, ...line } : item)));
    } else {
      setPurchaseDetail(current => [...current, { idTemp: new Date().getTime(), ...line }]);
    }

    // limpiar inputs para agregar otro producto
    setBulkFormDeta(CLEAN_LINE);
    setSendFormDeta(false);
  };

  return (
    {
      onQtyChange,
      onPriceChange,
      onDiscountChange,
      onTaxChange,
      onIsExoneratedChange,
      onIsBonusChange,
      disabledIsExonerated,
      disabledIsBonus,
      fnAddProduct
    }
  );
};
