import { useEffect, useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import notification from '@Containers/ui/Notifications';
import ControlPanel from '@Components/controlPanel';
import TableButtons from '@Components/tableButtons';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewOrders from './ModalViewOrders';
import ModalDiscounts from './ModalDiscounts';
import ModalProcessOrder from './ModalProcessOrder';
import ModalViewDoctos from './ModalViewDoctos';
import FormOrder from './FormOrder';
import DetailProduct from './DetailProduct';
import DetailTable from './DetailTable';
import FooterOrder from './FooterOrder';

const PurchaseOrders = (props) => {
  const { setLoading } = props;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [listProviders, setListProviders] = useState([]);
  const [listPaymenTypes, setListPaymentTypes] = useState([]);
  const [dataOrders, setDataOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [listWorkOrders, setListWorkOrders] = useState([]);
  const [dataPurchases, setDataPurchases] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [listTypeDocument, setListTypeDocument] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);
  const [openModalDiscount, setOpenModalDiscount] = useState(false);
  const [openModalProcess, setOpenModalProcess] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openModalViewDoctos, setOpenModalViewDoctos] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);

  const purchaseOrderValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentType"],
  }

  const purchaseOrderDetailValid = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validFloat(val) > 0, "msg.required.input.qty"],
    price: [(val) => validFloat(val) > 0, "msg.required.input.price"],
    undId: [(val) => validInt(val) > 0, "msg.required.select.units"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: DateHelper.format(new Date()),
    providerId: 0,
    paymentTypeId: 0,
    address: '',
    creditDays: 0,
    expectedDate: '',
    applicantName: '',
    workOrderId: 0,
    notes: '',
    valueExonerated: 0,
    valueExcent: 0,
    valueTaxed: 0,
    valueDiscount: 0,
    valueTax: 0,
    valueOthers: 0,
    valueTotal: 0,
    descriptionOthers: ''
  }, purchaseOrderValid);

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange:
    onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
      productCode: '',
      nameProduct: '',
      marca: '',
      qty: 1,
      price: 0,
      subTotal: 0,
      percentDiscount: 0,
      discount: 0,
      percentTax: 0,
      tax: 0,
      total: 0,
      nameUM: '',
      undId: 0,
      conversionFactor: 1,
      unitOptions: [],
      isExonerated: false
    }, purchaseOrderDetailValid);

  const { id, date, providerId, paymentTypeId, address, creditDays, expectedDate, applicantName, workOrderId, notes,
    valueExonerated, valueExcent, valueTaxed, valueDiscount, valueTax, valueOthers, valueTotal, descriptionOthers } = formState;
  const { productCode, nameProduct, marca, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total, nameUM,
    undId, conversionFactor, unitOptions, isExonerated } = formStateDeta;

  const fnViewOrderDetail = (orderId) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: orderId }), (resp) => {
      const ordersDeta = resp.data.map((item) => {
        item.nameProduct = item.productData.name
        item.marca = item.productData.tradeMark
        item.qtyRec = 0
        return item;
      });
      setOrderDetail(ordersDeta);
      fnRecalculateTotals(ordersDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnNewPurchaseOrder = () => {
    onResetForm();
    onResetFormDeta();
    setOrderDetail([]);
    setDataPurchases([]);
    setSendForm(false);
    setSendFormDeta(false);
  }

  const fnSearchPurchaseOrder = () => {
    setLoading(true);
    request.GET('inventory/process/purchaseOrders', (resp) => {
      const orders = resp.data.map((item) => {
        item.provider = item.providerData.name
        item.address = item.providerData.address
        item.total = formatNumber(item.valueTotal, '', 2)
        return item;
      });
      setDataOrders(orders);
      setOpenModalViewOrders(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSavePurchaseOrder = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (orderDetail.length === 0) {
      notification('warning', 'msg.required.select.product', 'alert.warning.title');
      return;
    }

    // Legacy (btnSaveDocument.Click): red de seguridad adicional a la validación que ya
    // bloquea agregar una línea con precio=0 — antes de guardar, vuelve a chequear que
    // ninguna línea del detalle quedó con precio en cero.
    if (orderDetail.some((item) => validFloat(item.price) === 0)) {
      notification('warning', 'msg.purchaseOrder.priceZero', 'alert.warning.title');
      return;
    }

    const newData = {
      date,
      providerId,
      paymentTypeId,
      typeId: 1,
      applicantName,
      notes,
      expectedDate: expectedDate === '' ? '1900-01-01' : expectedDate,
      creditDays,
      workOrderId,
      valueExcent,
      valueTaxed,
      valueDiscount,
      valueTax,
      valueOthers,
      descriptionOthers,
      valueTotal
    }

    orderDetail.map((item) => {
      delete item.id;
      return item;
    });

    if (id && id > 0) {
      setLoading(true);
      request.PUT(`inventory/process/purchaseOrders/${id}`, newData, (resp) => {
        setLoading(false);
        // Eliminar productos
        request.DELETE(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: id }), (resp2) => {
          // guardar productos
          orderDetail.forEach(item => {
            const productDeta = {
              purchaseOrderId: id,
              ...item
            }
            setLoading(true);
            request.POST('inventory/process/purchaseOrderDetail', productDeta, (resp3) => {
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
          });
          // imprimir la orden de compra
          request.GETPdf('inventory/process/purchaseOrders/exportPDFOrder', { id, userName: userData.name }, 'Orden de Compra.pdf',
            (err) => {

              setLoading(false);
            });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        }, false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/process/purchaseOrders', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        // guardar productos
        orderDetail.forEach(item => {
          const productDeta = {
            purchaseOrderId: resp.data.id,
            ...item
          }
          setLoading(true);
          request.POST('inventory/process/purchaseOrderDetail', productDeta, (resp2) => {
            setLoading(false);
          }, (err) => {

            setLoading(false);
          }, false);
        });
        fnViewOrderDetail(resp.data.id);
        // imprimir la orden de compra
        request.GETPdf('inventory/process/purchaseOrders/exportPDFOrder', { id: resp.data.id, userName: userData.name }, 'Orden de Compra.pdf',
          (err) => {

            setLoading(false);
          });
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnPrintPurchaseOrder = () => {
    if (id > 0) {
      request.GETPdf('inventory/process/purchaseOrders/exportPDFOrder', { id, userName: userData.name }, 'Orden de Compra.pdf',
        (err) => {

          setLoading(false);
        });
    }
  }

  const fnDeletePurchaseOrder = () => {
    if (id > 0) {
      const filterPurchases = dataPurchases.filter((item) => {
        return item.orderId === id
      });
      if (filterPurchases.length === 0) {
        setOpenMsgDelete(true);
      } else {
        notification('warning', 'msg.purchaseOrder.processed', 'alert.warning.title');
      }
    }
  }

  const fnOkDeletePurchaseOrder = () => {
    setLoading(true);
    request.DELETE(`inventory/process/purchaseOrders/${id}`, (resp) => {
      // eliminar detalle de la orden de compra
      setLoading(true);
      request.DELETE(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: id }), (resp2) => {
        setOpenMsgDelete(false);
        fnNewPurchaseOrder();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDiscounts = () => {
    setOpenModalDiscount(true);
  }

  const fnProcess = () => {
    if (id > 0) {
      setOpenMsgProcess(true);
    }
  }

  const fnProcessOrder = () => {
    setOpenModalProcess(true);
    setOpenMsgProcess(false);
  }

  const fnViewDoctos = () => {
    setOpenModalViewDoctos(true);
  }

  const fnViewProducts = () => {
    setOpenModalProducts(true);
  }

  // Legacy (Textbox_hw4.KeyPress, F1): al elegir el producto arma el combo de Unidad de
  // Medida con la unidad de empaque (Presentación) y, si es distinta, la unidad de
  // entrada — con la de empaque preseleccionada por defecto.
  const fnSelectProduct = (item) => {
    const options = [];
    if (item.packId) {
      options.push({ id: item.packId, name: item.packingData?.name || item.submission });
    }
    if (item.undinId && item.undinId !== item.packId) {
      options.push({ id: item.undinId, name: item.undInData?.name || item.inputUnit });
    }
    const defaultUnit = options[0];

    setBulkFormDeta({
      ...item,
      marca: item.tradeMark,
      unitOptions: options,
      undId: defaultUnit?.id || 0,
      nameUM: defaultUnit?.name || item.nameUM,
      conversionFactor: item.submConversion || 1
    });
    setOpenModalProducts(false);
  }

  const onUnitChange = (e) => {
    const selectedId = validInt(e.target.value);
    const selectedOption = unitOptions.find((opt) => opt.id === selectedId);
    setBulkFormDeta({
      undId: selectedId,
      nameUM: selectedOption?.name || ''
    });
  }

  // Legacy (Checkbox_hw1.Click, "Exonerado"): al marcarlo pone en cero el % de Impuesto y
  // el Impuesto de la línea que se está por agregar (no restaura nada al desmarcarlo,
  // igual que legacy).
  const onExoneratedChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const newTotal = validFloat(subTotal) - validFloat(discount);
      setBulkFormDeta({ isExonerated: true, percentTax: 0, tax: 0, total: newTotal });
    } else {
      setBulkFormDeta({ isExonerated: false });
    }
  }

  // Legacy (fnCalculateTotals): suma el detalle completo cada vez (no acumula deltas) —
  // Gravado = subtotales con impuesto != 0, Exento = subtotales sin impuesto y no
  // exonerados, Exonerado = subtotales de líneas marcadas Exonerado (tax_type=1),
  // independientemente del legacy no persiste "Exonerado" como columna propia del
  // encabezado — se recalcula siempre desde el detalle, así que tampoco se envía al backend.
  const fnRecalculateTotals = (details, othersValue = valueOthers) => {
    const gravado = details
      .filter((item) => !item.taxType && validFloat(item.tax) !== 0)
      .reduce((sum, item) => sum + validFloat(item.subTotal), 0);
    const exento = details
      .filter((item) => !item.taxType && validFloat(item.tax) === 0)
      .reduce((sum, item) => sum + validFloat(item.subTotal), 0);
    const exonerado = details
      .filter((item) => item.taxType)
      .reduce((sum, item) => sum + validFloat(item.subTotal), 0);
    const descuento = details.reduce((sum, item) => sum + validFloat(item.discount), 0);
    const impuesto = details.reduce((sum, item) => sum + validFloat(item.tax), 0);
    const total = exento + gravado + exonerado - descuento + impuesto + validFloat(othersValue);

    setBulkForm({
      valueExcent: exento,
      valueTaxed: gravado,
      valueExonerated: exonerado,
      valueDiscount: descuento,
      valueTax: impuesto,
      valueOthers: othersValue,
      valueTotal: total
    });
  }

  const fnViewOrder = (itemOrder) => {
    setBulkForm(itemOrder);
    fnViewOrderDetail(itemOrder.id);
    fnGetDocuments(itemOrder.id);
    setOpenModalViewOrders(false);
  }

  const fnGetDocuments = (orderId) => {
    request.GET(buildUrl('inventory/process/purchases', { orderId }), (resp) => {
      const purchase = resp.data.map((item) => {
        return {
          id: item.id,
          documentCode: item.documentCode,
          documentId: item.documentId,
          orderId: item.orderId,
          date: formatDate(item.date),
          numCai: item.numCai,
          subtotal: formatNumber(item.subtotal),
          discount: formatNumber(item.discount),
          tax: formatNumber(item.tax),
          total: formatNumber(item.total)
        }
      });
      setDataPurchases(purchase);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`admin/paymentTypes`, (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          usageType: item.usageType
        }
      })
      const filterPayments = paymentMethods.filter((item) => {
        return item.usageType === 2 || item.usageType === 3
      });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          address: item.address,
          creditDays: item.creditDays,
          cai: item.cai,
          providerType: item.providerType
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('inventory/settings/products?enableForPurchase=1', (resp) => {
      const data = resp.data.map((item) => {
        item.productCode = item.code
        item.nameProduct = item.name
        item.price = validFloat(item.priceLocalMid)
        item.subTotal = validFloat(item.priceLocalMid)
        item.tax = (validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100
        item.total = ((validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100) + validFloat(item.priceLocalMid)
        item.nameUM = item.submission
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        item.presentation = item.submission
        item.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
        return item;
      });
      setDataProducts(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET(`accounting/process/workOrders`, (resp) => {
      const orders = resp.data.map((item) => {
        return {
          label: item.description,
          value: item.id,
          idCtaCont: item.idCtaCont
        }
      })
      setListWorkOrders(orders);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListTypeDocument(documents);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewPurchaseOrder,
    fnSearch: fnSearchPurchaseOrder,
    fnSave: fnSavePurchaseOrder,
    fnPrint: fnPrintPurchaseOrder,
    fnDelete: fnDeletePurchaseOrder,
    buttonsHome: [
      {
        title: "button.discount",
        icon: "bi bi-percent",
        onClick: fnDiscounts
      },
      {
        title: "button.process",
        icon: "iconsminds-arrow-around",
        onClick: fnProcess
      },
      {
        title: "button.viewDoctos",
        icon: "bi bi-list-check",
        onClick: fnViewDoctos
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToFormOrder = {
    date,
    providerId,
    number: id,
    paymentTypeId,
    address,
    creditDays,
    expectedDate,
    listProviders,
    listPaymenTypes,
    onInputChange,
    setBulkForm,
    formValidation,
    sendForm
  }

  const propsToDetailProduct = {
    productCode,
    nameProduct,
    marca,
    qty,
    price,
    subTotal,
    percentDiscount,
    discount,
    percentTax,
    tax,
    total,
    nameUM,
    undId,
    conversionFactor,
    unitOptions,
    isExonerated,
    onUnitChange,
    onExoneratedChange,
    onInputChangeDeta,
    fnViewProducts,
    setBulkFormDeta,
    orderDetail,
    setOrderDetail,
    fnRecalculateTotals,
    formValidationDeta,
    isFormValidDeta,
    sendFormDeta,
    setSendFormDeta
  }

  const propsToDetailTable = {
    orderDetail,
    setOrderDetail,
    fnRecalculateTotals
  }

  const propsToFooterOrder = {
    applicantName,
    workOrderId,
    notes,
    valueExonerated,
    valueExcent,
    valueTaxed,
    valueDiscount,
    valueTax,
    valueOthers,
    valueTotal,
    descriptionOthers,
    listWorkOrders,
    orderDetail,
    onInputChange,
    setBulkForm,
    fnRecalculateTotals
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts,
      // ModalViewProd espera `fnSelectItem` (ver src/views/app/settings/productsCatalog/
      // ModalViewProd.jsx) — faltaba, así que el botón "ver" del catálogo nunca
      // seleccionaba nada: agregar productos a la orden estaba roto siempre.
      fnSelectItem: fnSelectProduct
    }
  }

  const propsToModalViewOrders = {
    ModalContent: ModalViewOrders,
    title: "page.purchaseOrders.modal.viewOrder.title",
    open: openModalViewOrders,
    setOpen: setOpenModalViewOrders,
    maxWidth: 'lg',
    data: {
      dataOrders,
      fnViewOrder
    }
  }

  const propsToModalDiscount = {
    ModalContent: ModalDiscounts,
    title: "page.purchaseOrders.modal.discounts.title",
    open: openModalDiscount,
    setOpen: setOpenModalDiscount,
    maxWidth: "sm",
    data: {
      orderDetail,
      setOrderDetail,
      fnRecalculateTotals,
      setLoading
    }
  }

  const propsToModalProcess = {
    ModalContent: ModalProcessOrder,
    title: "page.pruchaseOrders.modal.process.title",
    open: openModalProcess,
    setOpen: setOpenModalProcess,
    maxWidth: "lg",
    data: {
      orderId: id,
      providerId,
      paymentTypeId,
      nameRequire: applicantName,
      description: notes,
      workOrderId,
      valueOthers,
      listTypeDocument,
      listProviders,
      listLedgerAccounts,
      listWorkOrders,
      orderDetail,
      setOrderDetail,
      fnGetDocuments,
      fnViewOrderDetail,
      setLoading
    }
  }

  const propsToModalViewDoctos = {
    ModalContent: ModalViewDoctos,
    title: "page.purchaseOrders.modal.viewDoctos.title",
    open: openModalViewDoctos,
    setOpen: setOpenModalViewDoctos,
    maxWidth: "lg",
    data: {
      dataPurchases
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessOrder,
    title: "msg.question.processOrder.title"
  }

  const propsToMsgDelete = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnOkDeletePurchaseOrder,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <FormOrder {...propsToFormOrder} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <FooterOrder {...propsToFooterOrder} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewOrders} />
      <Modal {...propsToModalDiscount} />
      <Modal {...propsToModalProcess} />
      <Modal {...propsToModalViewDoctos} />
      <Confirmation {...propsToMsgProcess} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default PurchaseOrders;