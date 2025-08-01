import { useState } from 'react'
import { validFloat } from '@/helpers/Utils';

export const useDetailProduct = ({ idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, tax, total, lotCode, dateOutProd, isTaxFree, isBonus, setBulkFormDeta, purchaseDetail, setPurchaseDetail, setBulkForm, isFormValidDeta, setSendFormDeta }) => {

  const [disabledIsTaxFree, setDisabledIsTaxFree] = useState(false);
  const [disabledIsBonus, setDisabledIsBonus] = useState(false);

  const onQtyChange = e => {
    const subtotalValue = validFloat(price) * e.target.value;
    const discValue = (subtotalValue * validFloat(discountPercent)) / 100;
    const taxValue = ((subtotalValue - discValue) * validFloat(taxPercent)) / 100;
    const totalValue = subtotalValue - discValue + taxValue;

    const newQty = {
      qty: e.target.value,
      subTotal: subtotalValue,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newQty);
  }

  const onPriceChange = e => {
    const subtotalValue = validFloat(qty) * e.target.value;
    const discValue = (subtotalValue * validFloat(discountPercent)) / 100;
    const taxValue = ((subtotalValue - discValue) * validFloat(taxPercent)) / 100;
    const totalValue = subtotalValue - discValue + taxValue;

    const newPrice = {
      price: e.target.value,
      subTotal: subtotalValue,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newPrice);
  }

  const onDiscountChange = e => {
    const subtotalValue = validFloat(qty) * validFloat(price);
    const discValue = (subtotalValue * validFloat(e.target.value)) / 100;
    const taxValue = ((subtotalValue - discValue) * validFloat(taxPercent)) / 100;
    const totalValue = subtotalValue - discValue + taxValue;

    const newDiscount = {
      discountPercent: e.target.value,
      subTotal: subtotalValue,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newDiscount);
  }

  const onTaxChange = e => {
    const subtotalValue = validFloat(qty) * validFloat(price);
    const discValue = (subtotalValue * validFloat(discountPercent)) / 100;
    const taxValue = ((subtotalValue - discValue) * validFloat(e.target.value)) / 100;
    const totalValue = subtotalValue - discValue + taxValue;

    const newTax = {
      taxPercent: e.target.value,
      subTotal: subtotalValue,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newTax);
  }

  const onIsTaxChange = e => {
    const subtotalValue = validFloat(qty) * validFloat(price);
    if (!e.target.checked === 1 || !e.target.checked === true) {
      const newTax = {
        taxPercent: 0,
        tax: 0,
        isTaxFree: !e.target.checked,
        total: subtotalValue - discount
      }
      setBulkFormDeta(newTax);
      setDisabledIsBonus(true);
    } else {
      const newTax = {
        isTaxFree: !e.target.checked
      }
      setBulkFormDeta(newTax);
      setDisabledIsBonus(false);
    }
  }

  const onIsBonusChange = e => {
    if (!e.target.checked === 1 || !e.target.checked === true) {
      setDisabledIsTaxFree(true);
    } else {
      setDisabledIsTaxFree(false);
    }
    const checkBonus = {
      isBonus: !e.target.checked
    }
    setBulkFormDeta(checkBonus);
  }

  const fnAddProduct = () => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    const taxedValue = tax > 0 && (isTaxFree === 0 || isTaxFree === false) ? subTotal : 0;
    const exemptValue = tax === 0 && (isTaxFree === 0 || isTaxFree === false) ? subTotal : 0;
    const exoneratedValue = tax === 0 && (isTaxFree === 1 || isTaxFree === true) ? subTotal : 0;
    const bonification = (isBonus === 1 || isBonus === true) ? total : 0;

    const detail = {
      idTemp: new Date().getTime(),
      productCode,
      nameProduct,
      qty: validFloat(qty),
      price: validFloat(price),
      subTotal: validFloat(subTotal),
      discountPercent: validFloat(discountPercent),
      discount: validFloat(discount),
      taxPercent: validFloat(taxPercent),
      tax: validFloat(tax),
      total: validFloat(total),
      isBonus,
      isTaxFree,
      lotCode,
      dateOut: dateOutProd !== "" ? dateOutProd : "1900-01-01",
      subtotTaxValue: validFloat(taxedValue),
      subTotExeValue: validFloat(exemptValue),
      subTotExoValue: validFloat(exoneratedValue),
      bonification
    }

    if (idProd > 0) {
      purchaseDetail.map((item) => {
        if (item.idProd === idProd) {
          item.qty = validFloat(qty)
          item.price = validFloat(price)
          item.subTotal = validFloat(subTotal)
          item.discountPercent = validFloat(discountPercent)
          item.discount = validFloat(discount)
          item.taxPercent = validFloat(taxPercent)
          item.tax = validFloat(tax)
          item.total = validFloat(total)
          item.isBonus = isBonus
          item.isTaxFree = isTaxFree
          item.lotCode = lotCode
          item.dateOut = dateOutProd !== "" ? dateOutProd : "1900-01-01"
          item.subtotTaxValue = validFloat(taxedValue)
          item.subTotExeValue = validFloat(exemptValue)
          item.subTotExoValue = validFloat(exoneratedValue)
          item.bonification = bonification
        }
        return item;
      });
    } else {
      setPurchaseDetail(current => [...current, detail]);
    }

    const sumSubtotal = purchaseDetail.map(item => {
      const subtotal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotal);
      return subtotal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumDiscount = purchaseDetail.map(item => {
      const discountVal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.discount);
      return discountVal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumExempt = purchaseDetail.map(item => {
      const exempt = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotExeValue);
      return exempt;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumExonerated = purchaseDetail.map(item => {
      const exonerated = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotExoValue);
      return exonerated;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = purchaseDetail.map(item => {
      const taxes = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.tax);
      return taxes;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTaxed = purchaseDetail.map(item => {
      const taxed = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subtotTaxValue);
      return taxed;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTotal = purchaseDetail.map(item => {
      const totalVal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.total);
      return totalVal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumBonification = purchaseDetail.map(item => validFloat(item.bonification)).reduce((prev, curr) => prev + curr, 0);

    let valueSubtotal = 0;
    let exent = 0;
    let exonera = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let valueDiscount = 0;
    let valueTotal = 0;
    let valueBonification = 0;

    if (idProd > 0) {
      valueBonification = sumBonification;
    } else {
      valueBonification = validFloat(bonification) + sumBonification;
    }

    if (isBonus === 1 || isBonus === true || idProd > 0) {
      valueSubtotal = sumSubtotal;
      exent = sumExempt;
      exonera = sumExonerated;
      valueTaxed = sumTaxed;
      valueTaxes = sumTaxes;
      valueDiscount = sumDiscount;
      valueTotal = sumTotal;
    } else {
      valueSubtotal = validFloat(subTotal) + sumSubtotal;
      exent = validFloat(exemptValue) + sumExempt;
      exonera = validFloat(exoneratedValue) + sumExonerated;
      valueTaxed = validFloat(taxedValue) + sumTaxed;
      valueTaxes = validFloat(tax) + sumTaxes;
      valueDiscount = validFloat(discount) + sumDiscount;
      valueTotal = validFloat(total) + sumTotal;
    }

    const addProduct = {
      valueSubtotal,
      exent,
      exonera,
      gravado: valueTaxed,
      valueTax: valueTaxes,
      valueDiscount,
      valueTotal,
      bonification: valueBonification
    }
    setBulkForm(addProduct);

    // limpiar inputs para agregar otro producto
    const cleanProd = {
      idProd: 0,
      productCode: "",
      nameProduct: "",
      qty: 1,
      price: 0,
      subTotal: 0,
      discountPercent: 0,
      discount: 0,
      taxPercent: 0,
      tax: 0,
      total: 0,
      isBonus: 0,
      isTaxFree: 0,
      lotCode: '',
      dateOut: '',
      nameUM: '',
      previousCost: 0,
      currentExistence: 0
    }
    setBulkFormDeta(cleanProd);
    setDisabledIsBonus(false);
    setDisabledIsTaxFree(false);
    setSendFormDeta(false);
  }

  return (
    {
      onQtyChange,
      onPriceChange,
      onDiscountChange,
      onTaxChange,
      onIsTaxChange,
      onIsBonusChange,
      disabledIsTaxFree,
      disabledIsBonus,
      fnAddProduct
    }
  )
}
