import { validInt } from "@/helpers/Utils";
import { request } from "@/helpers/core";
import { useEffect, useState } from "react";
import ModalViewProd from "./ModalViewProd";
import ModalDistProducts from "./ModalDistProducts";
import ModalAddTrademarks from "./ModalAddTrademarks";
import { useForm } from "@Hooks/useForms";

const useProductsCatalog = ({ setLoading }) => {

  const [listProducts, setListProducts] = useState([]);
  const [listClassifications, setListClassifications] = useState([]);
  const [listMeasurementUnits, setListMeasurementUnits] = useState([]);
  const [listPackagingUnits, setListPackagingUnits] = useState([]);
  const [listMarks, setListMarks] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [activeTabPrices, setActiveTabPrices] = useState('1');
  const [dataStock, setDataStock] = useState([]);
  const listTaxPercent = [{ id: "0.00", name: "0.00" }, { id: "15.00", name: "15.00" }, { id: "18.00", name: "18.00" }];
  const [sendForm, setSendForm] = useState(false);

  const [openMsgGenerateCode, setOpenMsgGenerateCode] = useState(false);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openMsgDeleteProd, setOpenMsgDeleteProd] = useState(false);
  const [openModalDistProduct, setOpenModalDistProduct] = useState(false);
  const [openModalAddTrademark, setOpenModalAddTrademark] = useState(false);

  const productsCatalogValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"],
    classification: [(val) => val !== "", "msg.required.select.classification2"],
    type: [(val) => validInt(val) > 0, "msg.required.radio.type"],
    undinId: [(val) => validInt(val) > 0, "msg.required.select.units"],
    undoutId: [(val) => validInt(val) > 0, "msg.required.select.units"],
    packId: [(val) => validInt(val) > 0, "msg.required.select.packaging"],
    costValue: [(val) => validInt(val) > 0, "msg.required.input.averageCost"],
    typeCalculateCost: [(val) => validInt(val) > 0, "msg.required.select.typeCalculatePrice"],
    typeCalculatePrice: [(val) => validInt(val) > 0, "msg.required.select.typeCalculatePrice"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    status: 0,
    description: '',
    submConversion: '1.0000',
    type: 0,
    costValue: 0,
    maxCostValue: 0,
    lastCostValue: 0,
    percentTax: 0,
    taxValue: 0,
    typeCalculatePrice: 0,
    typeCalculateCost: 0,
    percentLocalPriceMin: 0,
    valuePercentLocalPriceMin: 0,
    priceLocalMin: 0,
    percentLocalPriceMid: 0,
    valuePercentLocalPriceMid: 0,
    priceLocalMid: 0,
    percentLocalPriceMax: 0,
    valuePercentLocalPriceMax: 0,
    priceLocalMax: 0,
    percentOutsidePriceMin: 0,
    valuePercentOutsidePriceMin: 0,
    priceOutsideMin: 0,
    percentOutsidePriceMid: 0,
    valuePercentOutsidePriceMid: 0,
    priceOutsideMid: 0,
    percentOutsidePriceMax: 0,
    valuePercentOutsidePriceMax: 0,
    priceOutsideMax: 0,
    parentProduct: 0,
    notes: '',
    enableForPurchase: false,
    enableForSale: false,
    paymentTax: false,
    requireExpLot: false,
    validToSale: false,
    paymentComiss: false,
    priceIncludeTax: false,
    dateLastPurchase: '',
    numLastPurchase: '',
    provLastPurchase: '',
    classification: '',
    submission: 0,
    tradeMark: 0,
    typeId: 0,
    undinId: 0,
    undoutId: 0,
    packId: 0,
    tradeId: 0,
  }, productsCatalogValid);

  const { id, code, name, status, description, submConversion, type, costValue, maxCostValue, lastCostValue, percentTax, taxValue,
    typeCalculatePrice, typeCalculateCost, percentLocalPriceMin, valuePercentLocalPriceMin, priceLocalMin, percentLocalPriceMid,
    valuePercentLocalPriceMid, priceLocalMid, percentLocalPriceMax, valuePercentLocalPriceMax, priceLocalMax, percentOutsidePriceMin, valuePercentOutsidePriceMin, priceOutsideMin, percentOutsidePriceMid, valuePercentOutsidePriceMid,priceOutsideMid, percentOutsidePriceMax, valuePercentOutsidePriceMax, priceOutsideMax, parentProduct, notes, enableForPurchase, enableForSale, paymentTax, requireExpLot, validToSale, paymentComiss, priceIncludeTax, dateLastPurchase, numLastPurchase, provLastPurchase, classification, submission, inputUnit, outputUnit, tradeMark, typeId, undinId, undoutId, packId, tradeId } = formState;

  const fnGenerateCode = () => {
    if (classification === "") {
      const codeRandom = new Uint32Array(1);
      window.crypto.getRandomValues(codeRandom);
      setBulkForm({ code: codeRandom[0], parentProduct: codeRandom[0] });
      setOpenMsgGenerateCode(false);
    } else {
      const filter = listClassifications.filter((item) => {
        return item.value === classification;
      });
      const nextCode = `${parseInt(filter[0].codeSeq, 10) + 1}`;
      const codeType = `${filter[0].codeInit}-${(nextCode).padStart(5, 0)}`;
      setBulkForm({ code: codeType, parentProduct: codeType });
    }
  }

  const fnConfirmGenerateCode = () => {
    if (classification === "") {
      setOpenMsgGenerateCode(true);
    } else {
      fnGenerateCode();
    }
  }

  const fnViewProduct = (item) => {
    const tax = parseFloat((item.percentTax / 100) * item.costValue).toFixed(2);
    item.taxValue = tax;
    setBulkForm(item);
    setOpenModalProducts(false);
    request.GET(`inventory/settings/products/getLastPurchase/${item.code}`, res => {
      const { data } = res;
      const { date, providerName, numCai } = data;
      const purchaseData = { dateLastPurchase: date, provLastPurchase: providerName, numLastPurchase: numCai }
      const itemData = { ...item, ...purchaseData };
      setBulkForm(itemData);
    }, err => {
      setBulkForm({});
    });
  }

  useEffect(() => {
    request.GET('inventory/settings/productsClassifications', (resp) => {
      const classifications = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          codeSeq: item.codeSeq,
          codeInit: item.codeInit
        }
      });
      setListClassifications(classifications);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    request.GET('inventory/settings/measurementUnits', (resp) => {
      const measurementUnits = resp.data.map((item) => {
        return {
          label: item.name.toUpperCase(),
          value: item.id,
          type: item.type,
          id: item.id,
          name: item.name.toUpperCase(),
        }
      });
      const packagingUnits = measurementUnits.filter((item) => {
        return item.type === 2;
      });
      setListPackagingUnits(packagingUnits);
      setListMeasurementUnits(measurementUnits);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    request.GET('inventory/settings/trademarks', (resp) => {
      const trademarks = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListMarks(trademarks);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const fnNewProduct = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSearchProduct = () => {
    setLoading(true);
    request.GET('inventory/settings/products', (resp) => {
      const data = resp.data.map((item) => {
        item.presentation = item.submission
        return item;
      });
      setDataProducts(data);
      const products = resp.data.map((item) => {
        return {
          label: `${item.code} - ${item.name}`,
          value: item.code
        }
      });
      setListProducts(products);
      setOpenModalProducts(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveProduct = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      code,
      name,
      description,
      classification,
      type,
      paymentTax,
      percentTax,
      typeId, undinId, undoutId, packId, tradeId,
      submConversion,
      typeCalculateCost,
      typeCalculatePrice,
      enableForPurchase,
      enableForSale,
      requireExpLot,
      validToSale,
      paymentComiss,
      priceIncludeTax,
      percentLocalPriceMin,
      valuePercentLocalPriceMin,
      priceLocalMin,
      percentLocalPriceMid,
      valuePercentLocalPriceMid,
      priceLocalMid,
      percentLocalPriceMax,
      valuePercentLocalPriceMax,
      priceLocalMax,
      percentOutsidePriceMin,
      valuePercentOutsidePriceMin,
      priceOutsideMin,
      percentOutsidePriceMid,
      valuePercentOutsidePriceMid,
      priceOutsideMid,
      percentOutsidePriceMax,
      valuePercentOutsidePriceMax,
      priceOutsideMax,
      costValue,
      lastCostValue,
      maxCostValue,
      notes,
      parentProduct: validInt(id) > 0 ? parentProduct : code,
      status
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/products/${id}`, newData, () => {
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/products', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintProduct = () => { }

  const fnDeleteProduct = () => {
    if (id > 0) {
      setOpenMsgDeleteProd(true);
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgDeleteProd(false);
    const data = {
      status: 0
    }
    if (id && id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/products/${id}`, data, () => {
        fnNewProduct();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnComposed = () => { }

  const fnDistribution = () => {
    if (code === '' || validInt(id) === 0) return;
    setOpenModalDistProduct(true)
  };

  const fnCodes = () => { }

  const fnCosts = () => { }

  const fnPrices = () => { }

  const fnStockControl = () => { }

  const fnBrands = () => {
    setOpenModalAddTrademark(true);
  }

  const fnCopy = () => { }

  const propsToControlPanel = {
    fnNew: fnNewProduct,
    fnSearch: fnSearchProduct,
    fnSave: fnSaveProduct,
    fnPrint: fnPrintProduct,
    fnDelete: fnDeleteProduct,
    buttonsHome: [
      {
        title: "button.composed",
        icon: "bi bi-list-check",
        onClick: fnComposed
      },
      {
        title: "button.distribution",
        icon: "bi bi-diagram-3",
        onClick: fnDistribution
      }
    ],
    buttonsOptions: [
      {
        title: "button.codes",
        icon: "bi bi-upc",
        onClick: fnCodes
      },
      {
        title: "button.costs",
        icon: "bi bi-coin",
        onClick: fnCosts
      },
      {
        title: "button.prices",
        icon: "bi bi-tag",
        onClick: fnPrices
      },
      {
        title: "button.stockControl",
        icon: "bi bi-box2",
        onClick: fnStockControl
      },
      {
        title: "button.brands",
        icon: "bi bi-bookmark-check",
        onClick: fnBrands
      },
      {
        title: "button.copy",
        icon: "bi bi-files",
        onClick: fnCopy
      }
    ],
    buttonsAdmin: []
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts,
      fnSelectItem: fnViewProduct
    }
  }

  const propsToModalDistProduct = {
    ModalContent: ModalDistProducts,
    title: "page.productsCatalog.modal.distProduct.title",
    open: openModalDistProduct,
    setOpen: setOpenModalDistProduct,
    maxWidth: 'lg',
    data: {
      setLoading,
      productId: id,
      productCode: code,
      productName: name,
      listPackagingUnits
    }
  }


  const propsToModalAddTrademarks = {
    ModalContent: ModalAddTrademarks,
    title: "page.storesProducts.modal.tademarks",
    open: openModalAddTrademark,
    setOpen: setOpenModalAddTrademark,
    maxWidth: 'sm',
    data: {
      setLoading,
      setListTrademarks: setListMarks
    }
  }

  const propsToMsgCode = {
    open: openMsgGenerateCode,
    setOpen: setOpenMsgGenerateCode,
    fnOnOk: fnGenerateCode,
    title: "msg.required.select.classification"
  }

  const propsToMsgDeleteProduct = {
    open: openMsgDeleteProd,
    setOpen: setOpenMsgDeleteProd,
    fnOnOk: fnDisableDocument,
    title: "alert.question.title"
  }

  return {
    formState,
    formValidation,
    isFormValid,
    onInputChange,
    onResetForm,
    setBulkForm,
    listClassifications,
    listMarks,
    listMeasurementUnits,
    listPackagingUnits,
    listTaxPercent,
    listProducts,
    activeTab,
    setActiveTab,
    activeTabPrices,
    setActiveTabPrices,
    sendForm,
    fnConfirmGenerateCode,
    dataStock,
    propsToControlPanel,
    propsToMsgDeleteProduct,
    propsToMsgCode,
    propsToModalViewProd,
    propsToModalDistProduct,
    propsToModalAddTrademarks,
  }

};

export default useProductsCatalog;