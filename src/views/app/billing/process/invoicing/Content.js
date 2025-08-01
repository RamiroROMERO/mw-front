import React, { useEffect, useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { validFloat, formatNumber, validInt } from "@/helpers/Utils";
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import ControlPanel from '@/components/controlPanel';
import TableButton from "@/components/tableButtons";
import notification from '@/containers/ui/Notifications';
import moment from 'moment';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import ModalProducts from './ModalProducts';
import ModalInvoices from './ModalViewInvoi';
import ModalChangePrice from './ModalChangePrice';
import ModalPrintInvoice from './ModalPrintInvoice';
import ModalGenerateInvoice from './ModalGenerateInvoice';
import ModalQuotation from './ModalQuotation';
import ModalDeliveryDoc from './ModalDeliveryDoc';
import InvoicingForm from './InvoicingForm';
import InvoicingDetail from './InvoicingDetail';
import InvoicingTable from './InvoicingTableProd';

const Invoicing = (props) => {
  const { setLoading } = props;
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listSellers, setListSellers] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState([]);
  const [dataInvoicing, setDataInvoicing] = useState([]);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openModalInvoices, setOpenModalInvoices] = useState(false);
  const [openModalPrice, setOpenModalPrice] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openModalGenerate, setOpenModalGenerate] = useState(false);
  const [openModalQuotation, setOpenModalQuotation] = useState(false);
  const [openModalDeliveryDoc, setOpenModalDeliveryDoc] = useState(false);
  const [openMsgCancelInvoice, setOpenMsgCancelInvoice] = useState(false);
  const [openMsgGenerateInvoice, setOpenMsgGenerateInvoice] = useState(false);
  const [sendFormIndex, setSendFormIndex] = useState(false);
  const [sendFormDetail, setSendFormDetail] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [idProd, setIdProd] = useState(0);

  const [recordSelected, setRecordSelected] = useState({});

  const invoicingValid = {
    documentCode: [(val) => val !== "0" && val !== "", "msg.required.select.typeDocument"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    documentType: [(val) => validInt(val) > 0, "msg.required.select.salesType"],
    currency: [(val) => validInt(val) > 0, "msg.required.select.currency"]
  }

  const invoiceDetailValid = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validInt(val) > 0, "msg.required.input.qty"],
    price: [(val) => validInt(val) > 0, "msg.required.input.price"],
  }

  const { formState: formIndex, formValidation: formValidationIndex, isFormValid: isFormValidIndex, onInputChange: onInputChangeIndex,
    onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex } = useForm({
      id: 0,
      customerId: 0,
      customerDNI: '',
      customerName: '',
      notes: '',
      documentCode: '',
      documentType: 1,
      currency: 1,
      date: moment(new Date()).format("YYYY-MM-DD"),
      dateInProcess: moment(new Date()).format("YYYY-MM-DD"),
      cashierId: 0,
      documentExo: false,
      documentId: 0,
      subTotalValue: 0,
      discountValue: 0,
      subTotExeValue: 0,
      subTotExoValue: 0,
      subtotTaxValue: 0,
      taxValue: 0,
      total: 0
    }, invoicingValid);

  const { formState: formDetail, formValidation: formValidationDetail, isFormValid: isFormValidDetail, onInputChange: onInputDetaChange,
    onResetForm: onResetFormDetail, setBulkForm: setBulkFormDetail } = useForm({
      productCode: '',
      description: '',
      areaId: 0,
      storeId: 0,
      unitProd: '',
      qty: 0,
      price: 0,
      subtotal: 0,
      discountPercent: 0,
      discountValue: 0,
      taxPercent: 0,
      taxValue: 0,
      total: 0,
      typePrice: 2,
      priceLocalMin: 0,
      priceLocalMid: 0,
      priceLocalMax: 0,
      otherPriceProd: 0,
      unitedCoste: 0,
      unitedOut: 0,
      qtyDist: 0,
      haveComiss: 0
    }, invoiceDetailValid);

  const { productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    total: totalProd, typePrice, priceLocalMin, priceLocalMid, priceLocalMax, otherPriceProd, unitedCoste, unitedOut, qtyDist,
    haveComiss, areaId, storeId } = formDetail;

  const { id, customerId, customerDNI, customerName, notes, documentCode, documentType, currency, date, dateInProcess, cashierId,
    documentExo, documentId, subTotalValue, discountValue: discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValue:
    taxValueInvoice, total } = formIndex;

  const handleAreaChange = e => {
    let valueStore = "0";
    let typePricelocal = 2;
    if (e.target.value > 0) {
      const dataArea = listAreas.filter((item) => {
        return item.id === parseInt(e.target.value, 10);
      });
      valueStore = dataArea[0].invStore !== null ? dataArea[0].invStore.id : "0";
      typePricelocal = dataArea[0].localPriceType;
    } else {
      valueStore = "0";
      typePricelocal = 2;
    }
    const newArea = {
      areaId: e.target.value,
      storeId: valueStore,
      typePrice: typePricelocal
    }
    setBulkFormDetail(newArea);
  }

  const handleQtyChange = e => {
    const subtotal1 = validFloat(e.target.value * price);
    const discount2 = validFloat((discountPercent * subtotal1) / 100);
    const tax1 = validFloat((taxPercent * (subtotal1 - discount2)) / 100);
    const total1 = validFloat((subtotal1 - discount2) + tax1);
    const newQty = {
      subtotal: subtotal1,
      discountValue: discount2,
      taxValue: tax1,
      total: total1,
      qty: e.target.value
    }
    setBulkFormDetail(newQty);
  }

  const handlePriceChange = e => {
    const subtotal2 = validFloat(e.target.value * qty);
    const discount3 = validFloat((discountPercent * subtotal2) / 100);
    const tax2 = validFloat((taxPercent * (subtotal2 - discount3)) / 100);
    const total2 = validFloat((subtotal2 - discount3) + tax2);
    const newPrice = {
      subtotal: subtotal2,
      discountValue: discount3,
      taxValue: tax2,
      total: total2,
      price: e.target.value
    }
    setBulkFormDetail(newPrice);
  }

  const handleDiscPercentChange = e => {
    const discount1 = validFloat((e.target.value * subtotal) / 100);
    const tax3 = validFloat((taxPercent * (subtotal - discount1)) / 100);
    const total3 = validFloat((subtotal - discount1) + taxValue);
    const newDiscount = {
      taxValue: tax3,
      total: total3,
      discountValue: discount1,
      discountPercent: e.target.value
    }
    setBulkFormDetail(newDiscount);
  }

  const handleTaxPercentChange = e => {
    const tax = validFloat((e.target.value * (subtotal - discountValue)) / 100);
    const total4 = validFloat((subtotal - discountValue) + tax);
    const newTax = {
      total: total4,
      taxValue: tax,
      taxPercent: e.target.value
    }
    setBulkFormDetail(newTax);
  }

  const handleExemptChange = e => {
    const sumTaxes = invoiceDetail.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = invoiceDetail.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = invoiceDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (!e.target.checked === true || !e.target.checked === 1) {
      valueExonerated = sumTaxed;
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = sumTotal - sumTaxes
    } else {
      valueExonerated = 0;
      valueTaxed = sumTaxed;
      valueTaxes = sumTaxes;
      totalInvoice = sumTotal;
    }

    const addProduct = {
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice,
      documentExo: !e.target.checked
    }
    setBulkFormIndex(addProduct);
  }

  const fnNewInvoicing = () => {
    setInvoiceDetail([]);
    onResetFormIndex();
    onResetFormDetail();
    setSendFormIndex(false);
    setSendFormDetail(false);
  }

  const fnViewInvoice = (item) => {
    onResetFormIndex();
    setRecordSelected(item);

    request.GET(`billing/process/invoiceDetail?idFather=${item.id}`, (resp) => {
      const invoiceProducts = resp.data.map((item2) => {
        return {
          id: item2.id,
          productCode: item2.productCode,
          description: item2.invProduct.name,
          qty: item2.qty,
          price: item2.price,
          subtotal: item2.subtotal,
          discountPercent: item2.discountPercent,
          taxPercent: item2.taxPercent,
          discountValue: item2.discountValue,
          subtotTaxValue: item2.taxValue > 0 ? item2.subtotal : 0,
          subTotExeValue: item2.taxValue === 0 ? item2.subtotal : 0,
          taxValue: item2.taxValue,
          total: item2.total,
          areaId: item2.areaId,
          storeId: item2.storeId,
          unitedCoste: item2.unitedCoste,
          typePrice: item2.typePrice,
          sellerCode: item2.sellerCode,
          qtyDist: item2.qtyDist,
          unitedOut: item2.unitedOut,
          haveComiss: item2.haveComiss
        }
      });
      setInvoiceDetail(invoiceProducts);
      setOpenModalInvoices(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSearchInvoicing = () => {
    setLoading(true);
    request.GET('billing/process/invoices?isPos=0', (resp) => {
      const invoices = resp.data.map((item) => {
        item.value = formatNumber(item.total);
        item.customerName = item.facCliente ? item.facCliente.nomcli : ''
        item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnViewInvoice(item)} />
        return item;
      });
      setDataInvoicing(invoices);
      setOpenModalInvoices(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveInvoicing = () => {
    setSendFormIndex(true);
    if (!isFormValidIndex) {
      return;
    }

    if (invoiceDetail.length === 0) {
      notification('warning', 'msg.required.select.product', 'alert.warning.title');
      return;
    }

    const newData = {
      documentCode,
      notes,
      date: date === '' ? moment(new Date()).format("YYYY-MM-DD") : date,
      customerId,
      subTotalValue,
      discountValue: discount,
      subtotTaxValue,
      subTotExeValue,
      subTotExoValue,
      taxValue: taxValueInvoice,
      total,
      isPos: 0,
      currency: validInt(currency),
      customerDNI,
      customerName,
      documentType: validInt(documentType),
      documentExo
    }

    invoiceDetail.map((item) => {
      delete item.id;
      return item;
    });

    if (id && id > 0) {
      setLoading(true);
      request.PUT(`billing/process/invoices/${id}`, newData, (resp) => {
        console.log(resp);
        setLoading(false);
        // Eliminar productos
        request.DELETE(`billing/process/invoiceDetail?idFather=${id}`, (resp2) => {
          console.log(resp2);
          // guardar productos
          const dataProducts = invoiceDetail.map((item) => {
            item.idFather = id;
            return item;
          });
          request.POST('billing/process/invoiceDetail/createMany', dataProducts, (resp3) => {
            console.log(resp3);
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('billing/process/invoices', newData, (resp) => {
        console.log(resp);
        onInputChangeIndex({ target: { name: 'id', value: resp.data.id } });
        // guardar productos
        const dataProducts = invoiceDetail.map((item) => {
          item.idFather = resp.data.id;
          return item;
        });
        request.POST('billing/process/invoiceDetail/createMany', dataProducts, (resp2) => {
          console.log(resp2);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintInvoicing = () => {
    if (id > 0) {
      setOpenModalPrint(true);
    }
  }

  const fnCancelInvoicing = () => {
    if (id > 0) {
      setOpenMsgCancelInvoice(true);
    }
  }

  const fnCancelInvoice = () => {
    const dataCancel = {
      isDeleted: 1
    }
    setLoading(true);
    request.PUT(`billing/process/invoices/${id}`, dataCancel, (resp) => {
      console.log(resp);
      setOpenMsgCancelInvoice(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnQuotation = () => {
    if (id > 0) {
      setOpenModalQuotation(true);
    }
  }

  const fnInvoice = () => {
    if (id > 0 && documentId === 0) {
      setOpenMsgGenerateInvoice(true);
    } else if (documentId > 0) {
      notification('warning', 'msg.generateInvoice', 'alert.warning.title');
    }
  }

  const fnGenerateInvoice = () => {
    setOpenMsgGenerateInvoice(false);
    setOpenModalGenerate(true);
  }

  const fnReferralGuide = () => { }

  const fnDeliver = () => {
    if (id > 0 && documentId > 0) {
      setOpenModalDeliveryDoc(true);
    } else if (documentId === 0) {
      notification('warning', 'msg.deliveryDoc', 'alert.warning.title');
    }
  }

  const fnSelectProduct = (item) => {
    onResetFormDetail();
    const newProduct = {
      productCode: item.productCode,
      description: item.name,
      unitProd: item.unitProd,
      taxPercent: validFloat(item.taxPercent),
      qty: 1,
      priceLocalMin: item.min,
      priceLocalMid: item.med,
      priceLocalMax: item.max,
      unitedCoste: item.costValue,
      unitedOut: item.outputUnit,
      qtyDist: item.qtyDist,
      haveComiss: item.paymentComiss
    }
    if (validInt(typePrice) === 1) {
      newProduct.price = validFloat(item.min);
      newProduct.subtotal = validFloat(item.min);
    } else if (validInt(typePrice) === 2) {
      newProduct.price = validFloat(item.med);
      newProduct.subtotal = validFloat(item.med);
    } else if (validInt(typePrice) === 3) {
      newProduct.price = validFloat(item.max);
      newProduct.subtotal = validFloat(item.max);
    } else {
      newProduct.price = 0;
      newProduct.subtotal = 0;
    }
    newProduct.taxValue = newProduct.subtotal * (newProduct.taxPercent > 0 ? newProduct.taxPercent / 100 : 0);
    newProduct.total = newProduct.subtotal + newProduct.taxValue;
    setBulkFormDetail(newProduct);
    setOpenModalProducts(false);
  }

  const fnViewProducts = () => {
    setLoading(true);
    setListProducts([]);
    request.GET(`inventory/process/stoks/getStoks?storeId=${storeId}&enableForSale=1`, (resp) => {
      const products = resp.data.map((item) => {
        item.taxPercent = item.percentTax
        item.unitProd = item.outputUnit
        item.min = item.priceLocalMin
        item.med = item.priceLocalMid
        item.max = item.priceLocalMax
        item.stock = formatNumber(item.stockQty)
        item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
        return item;
      });
      setListProducts(products);
      setOpenModalProducts(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnAddProduct = () => {
    setSendFormDetail(true);
    if (!isFormValidDetail) {
      return;
    }

    if (validInt(cashierId) === 0) {
      notification('warning', 'msg.required.select.seller', 'alert.warning.title');
      return;
    }

    const taxedValue = taxValue > 0 ? subtotal : 0;
    const exemptValue = taxValue === 0 ? subtotal : 0;

    // Cambiar codigo de vendedor
    const filterSellers = listSellers.filter((item) => {
      return item.value === cashierId;
    });

    const detail = {
      id: new Date().getTime(),
      productCode,
      description,
      qty: validFloat(qty),
      price: validFloat(price),
      subtotal: validFloat(subtotal),
      discountPercent: validFloat(discountPercent),
      discountValue: validFloat(discountValue),
      subtotTaxValue: validFloat(taxedValue),
      subTotExeValue: validFloat(exemptValue),
      taxPercent: validFloat(taxPercent),
      taxValue: validFloat(taxValue),
      total: validFloat(totalProd),
      areaId: validInt(areaId),
      storeId: validInt(storeId),
      unitedCoste: validFloat(unitedCoste),
      typePrice: validInt(typePrice),
      sellerCode: filterSellers ? filterSellers.code : "",
      qtyDist: validFloat(qtyDist),
      unitedOut,
      haveComiss: validInt(haveComiss)
    }

    const sumSubtotal = invoiceDetail.map(item => validFloat(item.subtotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = invoiceDetail.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = invoiceDetail.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = invoiceDetail.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = invoiceDetail.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = invoiceDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (documentExo === true || documentExo === 1) {
      valueExonerated = validFloat(taxedValue) + sumTaxed;
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = (validFloat(totalProd) + sumTotal) - (sumTaxes + taxValue);
    } else {
      valueExonerated = 0;
      valueTaxed = validFloat(taxedValue) + sumTaxed;
      valueTaxes = validFloat(taxValue) + sumTaxes;
      totalInvoice = validFloat(totalProd) + sumTotal;
    }

    const addProduct = {
      subTotalValue: validFloat(subtotal) + sumSubtotal,
      discountValue: validFloat(discountValue) + sumDiscount,
      subTotExeValue: validFloat(exemptValue) + sumExempt,
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice
    }
    setBulkFormIndex(addProduct);

    setInvoiceDetail(current => [...current, detail]);
    // limpiar inputs para agregar otro producto
    const cleanProd = {
      productCode: "",
      description: "",
      qty: 0,
      price: 0,
      subtotal: 0,
      discountPercent: 0,
      discountValue: 0,
      taxPercent: 0,
      taxValue: 0,
      total: 0,
      unitedCoste: 0,
      qtyDist: 0,
      unitedOut: "",
      unitProd: ""
    }
    setBulkFormDetail(cleanProd);
    setSendFormDetail(false);
  }

  const fnDeleteOkProduct = () => {
    setOpenMsgQuestion(false);
    const newArray = invoiceDetail.filter((item) => item.id !== idProd);
    setInvoiceDetail(newArray);

    const sumSubtotal = newArray.map(item => validFloat(item.subtotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = newArray.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = newArray.map(item => validFloat(item.exempt)).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = newArray.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = newArray.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newArray.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (documentExo === true || documentExo === 1) {
      valueExonerated = sumTaxed
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = sumTotal - sumTaxes;
    } else {
      valueExonerated = 0;
      valueTaxed = sumTaxed;
      valueTaxes = sumTaxes;
      totalInvoice = sumTotal;
    }

    const deleteProd = {
      subTotalValue: validFloat(sumSubtotal),
      discountValue: sumDiscount,
      subTotExeValue: sumExempt,
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice
    }
    setBulkFormIndex(deleteProd);
  }

  const fnDeleteProduct = (itemProd) => {
    setIdProd(itemProd.id);
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnChangePrice = () => {
    setOpenModalPrice(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useBill=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          id: item.code,
          code: item.code,
          name: `${item.code} | ${item.name}`
        }
      });
      setListTypeDocuments(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/areas?status=1', (resp) => {
      const areas = resp.data;
      setListAreas(areas);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const warehouse = resp.data;
      setListWarehouse(warehouse);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/users?isSeller=1&status=1', (resp) => {
      const users = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode
        }
      });
      setListSellers(users);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (recordSelected.id) {
      setBulkFormIndex(recordSelected);
    } else {
      onResetFormIndex();
    }
  }, [recordSelected]);

  const propsToControlPanel = {
    fnNew: fnNewInvoicing,
    fnSearch: fnSearchInvoicing,
    fnSave: fnSaveInvoicing,
    fnPrint: fnPrintInvoicing,
    fnCancel: fnCancelInvoicing,
    buttonsHome: [
      {
        title: "button.quotation",
        icon: "bi bi-file-text",
        onClick: fnQuotation
      },
      {
        title: "button.invoice",
        icon: "bi bi-receipt",
        onClick: fnInvoice
      },
      {
        title: "button.referralGuide",
        icon: "bi bi-file-earmark-text",
        onClick: fnReferralGuide
      },
      {
        title: "button.deliver",
        icon: "bi bi-clipboard2-check",
        onClick: fnDeliver
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToModalProducts = {
    ModalContent: ModalProducts,
    title: "page.invoicing.modal.products.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      listProducts
    }
  }

  const propsToModalInvoices = {
    ModalContent: ModalInvoices,
    title: "page.invoicing.modal.invoices.title",
    open: openModalInvoices,
    setOpen: setOpenModalInvoices,
    maxWidth: 'xl',
    data: {
      dataInvoicing
    }
  }

  const propsToModalPrices = {
    ModalContent: ModalChangePrice,
    title: "page.invoicing.modal.changePrice.title",
    open: openModalPrice,
    setOpen: setOpenModalPrice,
    maxWidth: 'sm',
    data: {
      typePrice,
      priceLocalMin,
      priceLocalMid,
      priceLocalMax,
      otherPriceProd,
      qty,
      discountPercent,
      taxPercent,
      onInputDetaChange,
      setBulkFormDetail
    }
  }

  const propsToModalPrint = {
    ModalContent: ModalPrintInvoice,
    title: "page.invoicing.modal.printInvoice.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: 'sm',
    data: {
      id,
      setLoading
    }
  }

  const propsToModalGenerate = {
    ModalContent: ModalGenerateInvoice,
    title: "page.invoicing.modal.generateInvoice.title",
    open: openModalGenerate,
    setOpen: setOpenModalGenerate,
    maxWidth: 'lg',
    data: {
      id,
      subTotalValue,
      discount,
      subTotExeValue,
      subTotExoValue,
      typeDocument: documentCode,
      subtotTaxValue,
      taxValueInvoice,
      total,
      currency,
      setLoading,
      setOpenModalPrint,
      onInputChangeIndex
    }
  }

  const propsToModalQuotation = {
    ModalContent: ModalQuotation,
    title: "page.invoicing.modal.generateQuotation.title",
    open: openModalQuotation,
    setOpen: setOpenModalQuotation,
    maxWidth: 'md',
    data: {
      id,
      customerId,
      listCustomers,
      setLoading
    }
  }

  const propsToModalDeliveryDoc = {
    ModalContent: ModalDeliveryDoc,
    title: "page.invoicing.modal.deliveryDoc.title",
    open: openModalDeliveryDoc,
    setOpen: setOpenModalDeliveryDoc,
    maxWidth: 'md',
    data: {
      id,
      customerId,
      listCustomers,
      setLoading
    }
  }

  const propsToInvoicingForm = {
    documentCode,
    customerId,
    notes,
    documentType,
    currency,
    date,
    dateInProcess,
    areaId,
    storeId,
    cashierId,
    documentExo,
    listTypeDocuments,
    listCustomers,
    listAreas,
    listWarehouse,
    listSellers,
    handleAreaChange,
    handleExemptChange,
    recordSelected,
    onInputChangeIndex,
    formValidationIndex,
    sendFormIndex,
    setBulkFormIndex,
    onInputDetaChange
  }

  const propsToInvoicingDetail = {
    productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    totalProd, onInputDetaChange, handleQtyChange, handlePriceChange, handleDiscPercentChange, handleTaxPercentChange,
    fnViewProducts, fnChangePrice, fnAddProduct, formValidationDetail, sendFormDetail
  }

  const propsToInvoicingTable = {
    invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, onInputChangeIndex,
    fnDeleteProduct
  }

  const propsToMsgCancelInvoice = {
    open: openMsgCancelInvoice,
    setOpen: setOpenMsgCancelInvoice,
    fnOnOk: fnCancelInvoice,
    title: "msg.question.cancelInvoice.title"
  }

  const propsToMsgGenerateInvoice = {
    open: openMsgGenerateInvoice,
    setOpen: setOpenMsgGenerateInvoice,
    fnOnOk: fnGenerateInvoice,
    title: "msg.question.generateInvoice.title"
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDeleteOkProduct,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <InvoicingForm {...propsToInvoicingForm} />
              <InvoicingDetail {...propsToInvoicingDetail} />
              <InvoicingTable {...propsToInvoicingTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalProducts} />
      <Modal {...propsToModalInvoices} />
      <Modal {...propsToModalPrices} />
      <Modal {...propsToModalPrint} />
      <Modal {...propsToModalGenerate} />
      <Modal {...propsToModalQuotation} />
      <Modal {...propsToModalDeliveryDoc} />
      <Confirmation {...propsToMsgDelete} />
      <Confirmation {...propsToMsgCancelInvoice} />
      <Confirmation {...propsToMsgGenerateInvoice} />
    </>
  );
}
export default Invoicing;