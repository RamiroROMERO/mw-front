import { validInt, validFloat, formatDate, IntlMessagesFn } from "@Helpers/Utils";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalViewProd from "./ModalViewProd";
import ModalDistProducts from "./ModalDistProducts";
import ModalAddTrademarks from "./ModalAddTrademarks";
import { useForm } from "@Hooks/useForms";
import { PATH_FILES } from '/src/helpers/pathFiles';
import { ModalCompProduct } from "./ModalCompProduct";
import { canOpenComponents } from "./compoundRules";
import ModalImages from "./ModalImages";
import ModalCosts from "./ModalCosts";
import ModalCopy from "./ModalCopy";
import ModalAddToStores from "./ModalAddToStores";
import ModalExport from "./ModalExport";
import ModalDistributeAll from "./ModalDistributeAll";
import { NotificationManager } from "@Components/common/react-notifications";
import { validateProduct, buildProductPayload } from "./productRules";
import { shouldLookupByCode, canApplyLookup } from "./productLookupRules";
import { normalizeStock, shouldFetchStock } from "./stockRules";
import { recalculatePrice, recalculateAllPrices, calculateTaxValue, defaultPercentsPatch } from "./priceRules";

const useProductsCatalog = ({ setLoading, canEditCosts = false }) => {

  const [listProducts, setListProducts] = useState([]);
  const [listClassifications, setListClassifications] = useState([]);
  const [listMeasurementUnits, setListMeasurementUnits] = useState([]);
  const [listPackagingUnits, setListPackagingUnits] = useState([]);
  const [listMarks, setListMarks] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [activeTabPrices, setActiveTabPrices] = useState('1');
  // Existencias por almacén (SPEC v2-14-sr): filas, total y si aplican al tipo de producto. Vienen del kardex vía el back.
  const [stock, setStock] = useState(() => normalizeStock(null));
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
  const [openModalCosts, setOpenModalCosts] = useState(false);
  const [openModalCopy, setOpenModalCopy] = useState(false);
  const [openModalAddToStores, setOpenModalAddToStores] = useState(false);
  const [openModalExport, setOpenModalExport] = useState(false);
  const [openModalDistributeAll, setOpenModalDistributeAll] = useState(false);
  const [createdProductCode, setCreatedProductCode] = useState('');

  const msgCopySelectProduct = IntlMessagesFn('msg.copy.selectProduct');
  const msgCopyMissingClassificationType = IntlMessagesFn('msg.copy.missingClassificationType');
  const msgCopyMissingUnits = IntlMessagesFn('msg.copy.missingUnits');
  const msgCopyZeroCost = IntlMessagesFn('msg.copy.zeroCost');
  const msgRefreshStockSuccess = IntlMessagesFn('page.productsCatalog.msg.refreshStockSuccess');

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    isDisabled: false,
    isCompound: false,
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

  // Pide las existencias del producto cargado (SPEC v2-14-sr). Una respuesta vieja nunca pisa a una más nueva. Si falla, el grid
  // queda vacío y no se avisa (igual que la última compra): la pantalla sigue siendo usable.
  const stockRequestRef = useRef(0);
  const fnLoadStock = (productCode) => {
    const requestId = ++stockRequestRef.current;
    request.GET(`inventory/settings/products/getStock/${encodeURIComponent(String(productCode).trim())}`, (res) => {
      if (requestId !== stockRequestRef.current) return;
      setStock(normalizeStock(res?.data));
    }, () => {
      if (requestId !== stockRequestRef.current) return;
      setStock(normalizeStock(null));
    });
  }

  // "Actualizar existencias" (SPEC v2-14-sr): recalcula inv_bodprod.existe de toda la empresa (productsStore/refreshStock,
  // privilegio 01.05.006 de Almacenes y Productos). Con un producto cargado vuelve a pedir su grid. Un rechazo (por ejemplo el 403
  // sin 01.05.006) muestra el mensaje real del back y el grid no cambia.
  const fnRefreshStock = () => {
    setLoading(true);
    request.POST('inventory/settings/productsStore/refreshStock', {}, () => {
      NotificationManager.success(msgRefreshStockSuccess, '', 4000, null, null, '');
      if (shouldFetchStock(currentRef.current)) fnLoadStock(currentRef.current.code);
    }, (err) => {
      notifyError(err, 'page.productsCatalog.msg.refreshStockError');
    }, false, () => setLoading(false));
  }

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
    fnLoadStock(item.code);
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
  }, []);

  // "Nuevo" (SPEC v2-09-sr): limpia el formulario y carga en las seis casillas de porcentaje los de `inv_porp`. Sin fila o con
  // una falla quedan en 0 y no se avisa. La respuesta no se aplica si mientras tanto se cargó otro producto.
  const fnNewProduct = () => {
    onResetForm();
    stockRequestRef.current += 1; // descarta una respuesta de existencias en vuelo
    setStock(normalizeStock(null));
    setSendForm(false);
    request.GET('inventory/settings/productsPercentages/default', (res) => {
      if (validInt(currentRef.current.id) !== 0) return;
      setBulkForm(defaultPercentsPatch(res?.data));
    }, () => { });
  }

  // Al salir de una casilla de porcentaje (pestaña Precios): calcula su valor y su total con el costo del tipo de cálculo.
  const fnCalculatePriceOf = (event) => {
    setBulkForm(recalculatePrice(formState, event.target.name));
  }

  // Cambio de un dato que entra en el cálculo (costo, tipo de costo, impuesto, "incluye ISV"): guarda el cambio y recalcula las
  // casillas con porcentaje. Solo lo dispara el usuario: cargar un producto no recalcula, para no pisar sus precios guardados.
  const onCostInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const next = { ...formState, [name]: type === 'checkbox' ? checked : value };
    onInputChange(event);
    setBulkForm({ ...recalculateAllPrices(next), taxValue: calculateTaxValue(next).toFixed(2) });
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
    if (!canOpenComponents(formState)) return;
    setOpenModalCompProduct(true);
  }

  const fnDistribution = () => {
    if (code === '' || validInt(id) === 0) return;
    setOpenModalDistProduct(true)
  };

  // "Distribuir Todos" no depende del producto cargado: actúa sobre todos los que no tienen distribución.
  const fnDistributeAll = () => {
    setOpenModalDistributeAll(true);
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
    if (!canEditCosts || validInt(id) === 0) return;
    setOpenModalCosts(true);
  }

  const fnPrices = () => { }

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

  // Exportar a Excel (SPEC v2-12-sr): exporta lo guardado en la DB, no lo que está en el formulario.
  const fnExport = () => setOpenModalExport(true);

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
        onClick: fnComposed,
        disabled: !canOpenComponents(formState)
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
      },
      {
        title: "button.export",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExport
      }
    ],
    buttonsOptions: [
      {
        title: "button.codes",
        icon: "bi bi-upc",
        onClick: fnCodes
      },
      ...(canEditCosts ? [{
        title: "button.costs",
        icon: "bi bi-coin",
        onClick: fnCosts
      }] : []),
      {
        title: "button.prices",
        icon: "bi bi-tag",
        onClick: fnPrices
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
      },
      {
        title: "button.distributeAll",
        icon: "bi bi-diagram-3-fill",
        onClick: fnDistributeAll
      },
      {
        title: "button.refreshStock",
        icon: "bi bi-arrow-repeat",
        onClick: fnRefreshStock
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
      listPackagingUnits,
      product: formState
    }
  }

  const propsToModalDistributeAll = {
    ModalContent: ModalDistributeAll,
    title: "page.productsCatalog.modal.distAll.title",
    open: openModalDistributeAll,
    setOpen: setOpenModalDistributeAll,
    maxWidth: 'lg',
    data: {
      setLoading
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

  const propsToModalCosts = {
    ModalContent: ModalCosts,
    title: "page.productsCatalog.modal.costs.title",
    open: openModalCosts,
    setOpen: setOpenModalCosts,
    maxWidth: 'md',
    data: {
      setLoading,
      productId: id,
      productCode: code,
      productName: name,
      productType: type,
      costs: { costValue, lastCostValue: formState.lastCostValue, maxCostValue: formState.maxCostValue },
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

  const propsToModalExport = {
    ModalContent: ModalExport,
    title: "page.productsCatalog.modal.export.title",
    open: openModalExport,
    setOpen: setOpenModalExport,
    maxWidth: 'sm',
    data: {}
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
    onCostInputChange,
    fnCalculatePriceOf,
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
    fnLoadByCode,

    stock,
    propsToControlPanel,
    propsToMsgDeleteProduct,
    propsToMsgCode,
    propsToModalViewProd,
    propsToModalDistProduct,
    propsToModalDistributeAll,
    propsToModalAddTrademarks,
    propsToModalCompProduct,
    propsToModalImagesProduct,
    propsToModalCosts,
    propsToModalCopy,
    propsToModalAddToStores,
    propsToModalExport
  }

};

export default useProductsCatalog;