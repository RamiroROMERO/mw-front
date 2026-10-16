import { validInt, validFloat, formatDate, IntlMessagesFn } from "@Helpers/Utils";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalViewProd from "./ModalViewProd";
import ModalDistProducts from "./ModalDistProducts";
import ModalAddTrademarks from "./ModalAddTrademarks";
import { useForm } from "@Hooks/useForms";
import { PATH_FILES } from '/src/helpers/pathFiles';
import { ModalCompProduct } from "./ModalCompProduct";
import ModalImages from "./ModalImages";
import ModalStockControl from "./ModalStockControl";
import ModalCosts from "./ModalCosts";
import ModalCopy from "./ModalCopy";
import ModalAddToStores from "./ModalAddToStores";
import { NotificationManager } from "@Components/common/react-notifications";
import { validateProduct, buildProductPayload } from "./productRules";
import { shouldLookupByCode, canApplyLookup } from "./productLookupRules";

const useProductsCatalog = ({ setLoading }) => {

  const [listProducts, setListProducts] = useState([]);
  const [listClassifications, setListClassifications] = useState([]);
  const [listMeasurementUnits, setListMeasurementUnits] = useState([]);
  const [listPackagingUnits, setListPackagingUnits] = useState([]);
  const [listMarks, setListMarks] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [activeTabPrices, setActiveTabPrices] = useState('1');
  const [dataStock, setDataStock] = useState([]);
  const [dataImages, setDataImages] = useState([]);
  const listTaxPercent = [{ id: "0.00", name: "0.00" }, { id: "15.00", name: "15.00" }, { id: "18.00", name: "18.00" }];
  const [sendForm, setSendForm] = useState(false);

  const [openMsgGenerateCode, setOpenMsgGenerateCode] = useState(false);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openMsgDeleteProd, setOpenMsgDeleteProd] = useState(false);
  const [openModalDistProduct, setOpenModalDistProduct] = useState(false);
  const [openModalAddTrademark, setOpenModalAddTrademark] = useState(false);
  const [openModalCompProduct, setOpenModalCompProduct] = useState(false);
  const [openModalImages, setOpenModalImages] = useState(false);
  const [openModalStockControl, setOpenModalStockControl] = useState(false);
  const [openModalCosts, setOpenModalCosts] = useState(false);
  const [openModalCopy, setOpenModalCopy] = useState(false);
  const [openModalAddToStores, setOpenModalAddToStores] = useState(false);
  const [createdProductCode, setCreatedProductCode] = useState('');

  const msgCopySelectProduct = IntlMessagesFn('msg.copy.selectProduct');
  const msgCopyMissingClassificationType = IntlMessagesFn('msg.copy.missingClassificationType');
  const msgCopyMissingUnits = IntlMessagesFn('msg.copy.missingUnits');
  const msgCopyZeroCost = IntlMessagesFn('msg.copy.zeroCost');

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    isDisabled: false,
    description: '',
    packQty: '1.0000',
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
    chargesTax: false,
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
  });

  // Mismas reglas que el back (productRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateProduct(formState), [formState]);
  const isFormValid = Object.keys(errors).length === 0;
  const formValidation = useMemo(() => {
    const valid = {};
    ['code', 'name', 'description', 'typeId', 'type', 'packId', 'undinId', 'undoutId', 'tradeId', 'packQty', 'costValue', 'typeCalculateCost', 'typeCalculatePrice', 'percentTax'].forEach((field) => {
      valid[`${field}Valid`] = errors[field] || null;
    });
    return valid;
  }, [errors]);

  const { id, code, name, packQty, type, costValue, typeId, undinId, undoutId } = formState;

  // Valores actuales del formulario para la carga por código: la respuesta es asíncrona y no debe pisar lo que el usuario escribió.
  const currentRef = useRef({ id, code });
  currentRef.current = { id, code };

  // Pide el código al back (SPEC v2-07-sr): reserva el siguiente número de la clasificación elegida, o el contador de la
  // empresa si no hay ninguna. Un rechazo muestra su mensaje real y el código no cambia.
  const fnGenerateCode = () => {
    const body = validInt(typeId) > 0 ? { typeId } : {};
    setOpenMsgGenerateCode(false);
    request.POST('inventory/settings/products/generateCode', body, (res) => {
      const generated = res?.data?.code;
      if (generated) setBulkForm({ code: generated, parentProduct: generated });
    }, (err) => {
      notifyError(err, 'page.productsCatalog.msg.generateCodeError');
    }, false);
  }

  const fnConfirmGenerateCode = () => {
    if (validInt(typeId) > 0) {
      fnGenerateCode();
    } else {
      setOpenMsgGenerateCode(true);
    }
  }

  const fnViewProduct = (item) => {
    const tax = parseFloat((item.percentTax / 100) * item.costValue).toFixed(2);
    item.taxValue = tax;
    setBulkForm(item);
    setOpenModalProducts(false);
    request.GET(`inventory/settings/products/getLastPurchase/${item.code}`, res => {
      const { data } = res;
      const purchaseData = { dateLastPurchase: data?.date ? formatDate(data.date) : '', provLastPurchase: data?.providerName || '', numLastPurchase: data?.numCai || '' }
      setBulkForm(purchaseData);
    }, () => { });
  }

  // Carga por código (SPEC v2-08-sr): al salir del campo Código con un producto nuevo, si el código ya existe se carga igual que
  // con Buscar. Un código que no existe es el caso normal de un alta: el back responde notFound y no se hace nada ni se avisa.
  const fnLoadByCode = () => {
    if (!shouldLookupByCode({ id, code })) return;
    const requestedCode = code.trim();
    request.GET(`inventory/settings/products/byCode/${encodeURIComponent(requestedCode)}`, (res) => {
      const item = res?.data;
      if (!item) return;
      if (!canApplyLookup({ requestedCode, currentCode: currentRef.current.code, currentId: currentRef.current.id })) return;
      fnViewProduct(item);
    }, () => { });
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
      setLoading(false);
    });
    request.GET('inventory/settings/measurementUnits', (resp) => {
      const measurementUnits = resp.data.map((item) => {
        return {
          label: item.name.toUpperCase(),
          value: item.id,
          isPackaging: !!item.isPackaging,
          id: item.id,
          name: item.name.toUpperCase(),
        }
      });
      const packagingUnits = measurementUnits.filter((item) => {
        return item.isPackaging;
      });
      setListPackagingUnits(packagingUnits);
      setListMeasurementUnits(measurementUnits);
      setLoading(false);
    }, (err) => {
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
      setLoading(false);
    });
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {
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
      setLoading(false);
    });
  }

  // Payload de alta/edición y de "Copiar" (que clona este mismo payload con código/nombre/clasificación nuevos); ver productRules.js.
  const fnBuildProductPayload = () => buildProductPayload(formState, { isNew: validInt(id) === 0 });

  const fnSaveProduct = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = fnBuildProductPayload();

    if (id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/products/${id}`, newData, () => {
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/products', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(false);
        // SPEC v2-08-sr: tras el alta (no tras Copiar) se ofrece agregar el producto a los almacenes.
        setCreatedProductCode(newData.code);
        setOpenModalAddToStores(true);
      }, (err) => {
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
      isDisabled: 1
    }
    if (id && id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/products/${id}`, data, () => {
        fnNewProduct();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnComposed = () => {
    if (code === "" || validInt(id) === 0) return;
    setOpenModalCompProduct(true);
  }

  const fnDistribution = () => {
    if (code === '' || validInt(id) === 0) return;
    setOpenModalDistProduct(true)
  };

  const fnImages = () => {
    if (validInt(id) === 0) return;
    fnGetImages();
    setOpenModalImages(true);
  }

  const fnGetImages = () => {
    const id = code;
    setDataImages([]);

    setLoading(true);
    request.GET(buildUrl('inventory/settings/productPictures', { productCode: id }), (resp) => {
      const { data } = resp;

      if (data.length > 0) {
        data.map(async (item) => {
          const imageUrl = `${PATH_FILES.GET.PICTURES}${item.name}`;
          const imageObjectURL = await request.getFile(imageUrl);
          item.src = imageObjectURL
          setDataImages((prev) => [...prev, item]);
        });
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnCodes = () => { }

  const fnCosts = () => {
    if (validInt(id) === 0) return;
    setOpenModalCosts(true);
  }

  const fnPrices = () => { }

  const fnStockControl = () => {
    if (validInt(id) === 0) return;
    setOpenModalStockControl(true);
  }

  const fnBrands = () => {
    setOpenModalAddTrademark(true);
  }

  // Copiar Producto (inv_prod_copy.sc2 + Controlpanelbtn7.Click de inv_products.sc2):
  // mismas validaciones previas que el legacy antes de abrir el diálogo.
  const fnCopy = () => {
    if (validInt(id) === 0) {
      NotificationManager.error(msgCopySelectProduct, '', 4000, null, null, '');
      return;
    }
    if (validInt(typeId) === 0 || validInt(type) === 0) {
      NotificationManager.error(msgCopyMissingClassificationType, '', 4000, null, null, '');
      return;
    }
    if (validInt(undinId) === 0 || validInt(undoutId) === 0 || validFloat(packQty) === 0) {
      NotificationManager.error(msgCopyMissingUnits, '', 4000, null, null, '');
      return;
    }
    if (validFloat(costValue) === 0) {
      NotificationManager.error(msgCopyZeroCost, '', 4000, null, null, '');
      return;
    }
    setOpenModalCopy(true);
  }

  // El legacy resetea Descripción a vacío y arranca Existe/Elimina en 0 para el clon;
  // el resto de los campos (costos, precios, unidades, checks) se clonan tal cual.
  const fnSaveCopy = (newTypeId, newCode, newName) => {
    const newData = {
      ...fnBuildProductPayload(),
      code: newCode,
      name: newName,
      description: '',
      typeId: newTypeId,
      parentProduct: newCode
    };

    setLoading(true);
    request.POST('inventory/settings/products', newData, (resp) => {
      setBulkForm({
        ...newData,
        id: resp.data.id,
        dateLastPurchase: '',
        numLastPurchase: '',
        provLastPurchase: ''
      });
      setOpenModalCopy(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

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
      },
      {
        title: "button.images",
        icon: "bi bi-image",
        onClick: fnImages
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

  const propsToModalCompProduct = {
    ModalContent: ModalCompProduct,
    title: "page.productsCatalog.modal.compProduct.title",
    open: openModalCompProduct,
    setOpen: setOpenModalCompProduct,
    maxWidth: 'lg',
    data: {
      setLoading,
      productId: id,
      productCode: code,
      productName: name,
      listProducts
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

  const propsToModalImagesProduct = {
    ModalContent: ModalImages,
    title: "page.productsCatalog.modal.imageProduct.title",
    open: openModalImages,
    setOpen: setOpenModalImages,
    valueTitle: `${code} - ${name}`,
    maxWidth: 'md',
    data: {
      productCode: code,
      dataImages,
      fnGetImages,
      setLoading
    }
  }

  const propsToModalStockControl = {
    ModalContent: ModalStockControl,
    title: "page.productsCatalog.modal.stockControl.title",
    open: openModalStockControl,
    setOpen: setOpenModalStockControl,
    maxWidth: 'lg',
    data: {
      setLoading,
      productId: id,
      productCode: code,
      productName: name,
      listProviders,
      product: formState,
      setBulkForm
    }
  }

  const propsToModalCosts = {
    ModalContent: ModalCosts,
    title: "page.productsCatalog.modal.costs.title",
    open: openModalCosts,
    setOpen: setOpenModalCosts,
    maxWidth: 'sm',
    data: {
      setLoading,
      productId: id,
      productCode: code,
      productName: name,
      setBulkForm
    }
  }

  const propsToModalCopy = {
    ModalContent: ModalCopy,
    title: "page.productsCatalog.modal.copy.title",
    open: openModalCopy,
    setOpen: setOpenModalCopy,
    maxWidth: 'md',
    data: {
      currentCode: code,
      currentName: name,
      currentTypeId: typeId,
      listClassifications,
      fnSaveCopy
    }
  }

  const propsToModalAddToStores = {
    ModalContent: ModalAddToStores,
    title: "page.productsCatalog.modal.addToStores.title",
    open: openModalAddToStores,
    setOpen: setOpenModalAddToStores,
    maxWidth: 'sm',
    data: {
      productCode: createdProductCode
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
    listProviders,
    activeTab,
    setActiveTab,
    activeTabPrices,
    setActiveTabPrices,
    sendForm,
    fnConfirmGenerateCode,
    fnLoadByCode,

    dataStock,
    propsToControlPanel,
    propsToMsgDeleteProduct,
    propsToMsgCode,
    propsToModalViewProd,
    propsToModalDistProduct,
    propsToModalAddTrademarks,
    propsToModalCompProduct,
    propsToModalImagesProduct,
    propsToModalStockControl,
    propsToModalCosts,
    propsToModalCopy,
    propsToModalAddToStores
  }

};

export default useProductsCatalog;