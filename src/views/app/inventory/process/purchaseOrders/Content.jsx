import { useEffect, useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import notification from '@Containers/ui/Notifications';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalSearchOrders from './ModalSearchOrders';
import ModalDiscounts from './ModalDiscounts';
import ModalProcessOrder from './ModalProcessOrder';
import ModalViewDoctos from './ModalViewDoctos';
import FormOrder from './FormOrder';
import DetailProduct from './DetailProduct';
import DetailTable from './DetailTable';
import FooterOrder from './FooterOrder';
import {
  calculateLine, calculateTotals, validateOrder, validateLine, buildOrderPayload, displayExpectedDate, lineFromServer
} from './purchaseOrderRules';

const PurchaseOrders = (props) => {
  const { setLoading } = props;
  const [listProviders, setListProviders] = useState([]);
  const [listPaymenTypes, setListPaymentTypes] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [listWorkOrders, setListWorkOrders] = useState([]);
  const [dataPurchases, setDataPurchases] = useState([]);
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

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
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
    valueExempt: 0,
    valueTaxed: 0,
    valueDiscount: 0,
    valueTax: 0,
    valueOthers: 0,
    valueTotal: 0,
    descriptionOthers: ''
  });

  const { formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
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
    });

  const { id, date, providerId, paymentTypeId, address, creditDays, expectedDate, applicantName, workOrderId, notes,
    valueExonerated, valueExempt, valueTaxed, valueDiscount, valueTax, valueOthers, valueTotal, descriptionOthers } = formState;
  const { productCode, nameProduct, marca, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total, nameUM,
    undId, conversionFactor, unitOptions, isExonerated } = formStateDeta;

  const errors = sendForm ? validateOrder(formState, orderDetail) : {};
  const errorsDeta = sendFormDeta ? validateLine(formStateDeta) : {};

  // `othersValue`: otros recargos de la orden que se está cargando (el estado del formulario aún trae los de la anterior).
  const fnViewOrderDetail = (orderId, othersValue) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: orderId }), (resp) => {
      const ordersDeta = resp.data.map(lineFromServer);
      setOrderDetail(ordersDeta);
      fnRecalculateTotals(ordersDeta, othersValue);
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

  // El buscador (ModalSearchOrders) pide las órdenes por páginas con búsqueda en el servidor.
  const fnSearchPurchaseOrder = () => {
    setOpenModalViewOrders(true);
  }

  // Encabezado y detalle viajan juntos y se guardan en una transacción en el back, que además calcula los totales.
  const fnSavePurchaseOrder = () => {
    setSendForm(true);
    const validation = validateOrder(formState, orderDetail);
    if (Object.keys(validation).length > 0) {
      if (validation.details) notification('warning', validation.details, 'alert.warning.title');
      return;
    }

    const payload = buildOrderPayload(formState, orderDetail);
    const printOrder = (orderId) => fnPrintDocument(orderId, 'Orden de Compra.pdf');

    setLoading(true);
    if (id && id > 0) {
      request.PUT(`inventory/process/purchaseOrders/${id}`, payload, (resp) => {
        fnViewOrderDetail(id, payload.valueOthers);
        printOrder(id);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      request.POST('inventory/process/purchaseOrders', payload, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnViewOrderDetail(resp.data.id, payload.valueOthers);
        printOrder(resp.data.id);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  // El back imprime lo GUARDADO por GET (la orden: `print`; la hoja de recepción: `receipt`).
  const fnPrintDocument = (orderId, fileName, suffix) => printDocument({
    path: 'inventory/process/purchaseOrders', id: orderId, fileName, suffix, setLoading
  });

  const fnPrintPurchaseOrder = () => fnPrintDocument(id, 'Orden de Compra.pdf');

  // Legacy (Controlpanelbtn1, Inv_OC_receipt): hoja de recepción con cantidad, lote y vencimiento por producto.
  const fnPrintReceipt = () => fnPrintDocument(id, 'Recepcion de Orden de Compra.pdf', 'receipt');

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

  // El back borra el detalle y la orden en una transacción y rechaza una orden con compras ligadas.
  const fnOkDeletePurchaseOrder = () => {
    setLoading(true);
    request.DELETE(`inventory/process/purchaseOrders/${id}`, (resp) => {
      setOpenMsgDelete(false);
      fnNewPurchaseOrder();
      setLoading(false);
    }, (err) => {
      setOpenMsgDelete(false);
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

    // El buscador compartido (ModalViewProd) entrega el producto tal cual viene del catálogo: se arman aquí los campos de la
    // línea. El precio sugerido es el precio local medio del producto (como la lista anterior de esta pantalla); el legacy lo
    // dejaba en blanco para digitarlo.
    const price = validFloat(item.priceLocalMid);
    const lineValues = calculateLine({ qty, price, percentDiscount, percentTax: item.percentTax, isExonerated: false });
    setBulkFormDeta({
      productCode: item.code,
      nameProduct: item.name,
      marca: item.tradeMark,
      price,
      percentTax: lineValues.percentTax,
      subTotal: lineValues.subTotal,
      discount: lineValues.discount,
      tax: lineValues.tax,
      total: lineValues.total,
      isExonerated: false,
      unitOptions: options,
      undId: defaultUnit?.id || 0,
      nameUM: defaultUnit?.name || item.submission || '',
      conversionFactor: item.packQty || 1
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

  // Legacy (fnCalculateTotals): suma el detalle completo cada vez (no acumula deltas). Es una vista previa: el back recalcula
  // todo al guardar con las mismas reglas (purchaseOrderRules.js). "Exonerado" no se guarda en la orden: se recalcula siempre
  // del detalle.
  const fnRecalculateTotals = (details, othersValue = valueOthers) => {
    // valueOthers se deja tal cual se escribe (no redondeado) para no cortar un decimal a medio teclear.
    setBulkForm({ ...calculateTotals(details, othersValue), valueOthers: othersValue });
  }

  const fnViewOrder = (itemOrder) => {
    setBulkForm({ ...itemOrder, expectedDate: displayExpectedDate(itemOrder.expectedDate) });
    fnViewOrderDetail(itemOrder.id, itemOrder.valueOthers);
    fnGetDocuments(itemOrder.id);
    setOpenModalViewOrders(false);
  }

  // Legacy (btnContainer, Ver Doctos): las compras de la orden (inv_compras.codoc) y sus boletas de compra (inv_shopping_ticket.id_oc).
  const fnGetDocuments = (orderId) => {
    request.GET(buildUrl('inventory/process/purchases', { orderId }), (resp) => {
      const purchases = resp.data.map((item) => {
        return {
          id: `purchase-${item.id}`,
          kind: 'purchase',
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
      setDataPurchases(purchases);
      setLoading(false);
      fnGetTickets(orderId, purchases);
    }, (err) => {

      setLoading(false);
    });
  }

  // Las boletas no traen totales en su lista: se suman de su detalle (una consulta por boleta, normalmente 0 o 1).
  const fnGetTickets = (orderId, purchases) => {
    request.GET(buildUrl('inventory/process/ticketPurchase', { idOc: orderId }), (resp) => {
      const tickets = resp.data || [];
      if (tickets.length === 0) return;
      Promise.all(tickets.map((ticket) => new Promise((resolve) => {
        request.GET(`inventory/process/ticketPurchase/${ticket.id}/detail`, (respDeta) => {
          const total = (respDeta.data || []).reduce((sum, line) => sum + validFloat(line.valueTotal1), 0);
          resolve({
            id: `ticket-${ticket.id}`,
            kind: 'ticket',
            documentCode: ticket.documentCode,
            documentId: ticket.documentId,
            orderId,
            date: formatDate(ticket.date),
            numCai: ticket.numberCAI,
            subtotal: formatNumber(total),
            discount: formatNumber(0),
            tax: formatNumber(0),
            total: formatNumber(total)
          });
        }, () => resolve(null), false);
      }))).then((rows) => {
        setDataPurchases([...purchases, ...rows.filter(Boolean)]);
      });
    }, () => { }, false);
  }

  useEffect(() => {
    setLoading(true);
    // El back devuelve solo las formas de pago que acepta el guardado (uso 2 o 3 y no eliminadas).
    request.GET('inventory/process/purchaseOrders/paymentTypes', (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      })
      setListPaymentTypes(paymentMethods);
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
        title: "button.receipt",
        icon: "bi bi-box-seam",
        onClick: fnPrintReceipt
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
    errors
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
    errorsDeta,
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
    valueExempt,
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
    fnRecalculateTotals,
    errors
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      // ModalViewProd espera `fnSelectItem` (ver src/views/app/settings/productsCatalog/
      // ModalViewProd.jsx) — faltaba, así que el botón "ver" del catálogo nunca
      // seleccionaba nada: agregar productos a la orden estaba roto siempre.
      fnSelectItem: fnSelectProduct
    }
  }

  const propsToModalViewOrders = {
    ModalContent: ModalSearchOrders,
    title: "page.purchaseOrders.modal.viewOrder.title",
    open: openModalViewOrders,
    setOpen: setOpenModalViewOrders,
    maxWidth: 'lg',
    data: {
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