import { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import moment from 'moment';

export const useModalInvoice = ({ bookingId, baseRate, creditDays, roomId, checkInDate, checkOutDate, setLoading, setOpen }) => {
  const [dataServices, setDataServices] = useState([]);
  const [dataPayments, setDataPayments] = useState([]);
  const [listTypePayments, setListTypePayments] = useState([]);
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCashiers, setListCashiers] = useState([]);
  const [listCashBoxes, setListCashBoxes] = useState([]);
  const [totalValServices, setTotalValServices] = useState(0);
  const [totalValPayments, setTotalValPayments] = useState(0);
  const [openModalGenerateInvoice, setOpenModalGenerateInvoice] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const invoicingValid = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    documentType: [(val) => validInt(val) > 0, "msg.required.select.salesType"],
    cashId: [(val) => validInt(val) > 0, "msg.required.select.cashBox"],
    cashierId: [(val) => validInt(val) > 0, "msg.required.select.cashier"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    invoiceDate: moment(new Date()).format("YYYY-MM-DD"),
    documentCode: "",
    billingToCompany: 0,
    cashId: 0,
    cashierId: 0,
    documentType: 1,
    price: baseRate,
    qty: 0,
    subtotal: baseRate,
    discountPercent: 0,
    discountValue: 0,
    taxPercent: 0,
    taxValue: 0,
    otherTaxPercent: 0,
    otherTaxValue: 0,
    total: baseRate,
  }, invoicingValid);

  const {invoiceDate, documentCode, billingToCompany, cashId, cashierId, documentType, price, qty, subtotal, discountPercent, discountValue, taxPercent, taxValue, otherTaxPercent, otherTaxValue, total} = formState;

  const onPriceChange = e => {
    const subtotal = validFloat(e.target.value * qty);
    const discount = validFloat((discountPercent * subtotal) / 100);
    const tax = validFloat((taxPercent * (subtotal - discount)) / 100);
    const otherTax = validFloat((otherTaxPercent * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(tax) + validFloat(otherTax);
    const newPrice = {
      subtotal: subtotal,
      discountValue: discount,
      taxValue: tax,
      otherTaxValue: otherTax,
      total: totalCost,
      price: e.target.value
    }
    onBulkForm(newPrice);
  }

  const onQtyChange = e => {
    const subtotal = validFloat(e.target.value * price);
    const discount = validFloat((discountPercent * subtotal) / 100);
    const tax = validFloat((taxPercent * (subtotal - discount)) / 100);
    const otherTax = validFloat((otherTaxPercent * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(tax) + validFloat(otherTax);
    const newPrice = {
      subtotal: subtotal,
      discountValue: discount,
      taxValue: tax,
      otherTaxValue: otherTax,
      total: totalCost,
      qty: e.target.value
    }
    onBulkForm(newPrice);
  }

  const onDiscountPercentChange = e => {
    const discount = validFloat((e.target.value * subtotal) / 100);
    const tax = validFloat((taxPercent * (subtotal - discount)) / 100);
    const otherTax = validFloat((otherTaxPercent * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(tax) + validFloat(otherTax);
    const newDiscount = {
      discountValue: discount,
      taxValue: tax,
      otherTaxValue: otherTax,
      total: totalCost,
      discountPercent: e.target.value
    }
    onBulkForm(newDiscount);
  }

  const onDiscountValueChange = e => {
    const discount = validFloat(e.target.value);
    const discountPer = validFloat((e.target.value * 100)/subtotal);
    const tax = validFloat((taxPercent * (subtotal - discount)) / 100);
    const otherTax = validFloat((otherTaxPercent * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(tax) + validFloat(otherTax);
    const newDiscountPerc = {
      discountPercent: discountPer,
      taxValue: tax,
      otherTaxValue: otherTax,
      total: totalCost,
      discountValue: e.target.value
    }
    onBulkForm(newDiscountPerc);
  }

  const onTaxPercentChange = e => {
    const tax = validFloat((e.target.value * (subtotal - discountValue)) / 100);
    const totalCost = validFloat(subtotal - discountValue) + validFloat(tax) + validFloat(otherTaxValue);
    const newTaxPercent = {
      taxValue: tax,
      total: totalCost,
      taxPercent: e.target.value
    }
    onBulkForm(newTaxPercent);
  }

  const onTaxValueChange = e => {
    const taxValue = validFloat(e.target.value);
    const taxPercent = validFloat((taxValue * 100) /  (subtotal - discountValue));
    const totalCost = validFloat(subtotal - discountValue) + validFloat(taxValue) + validFloat(otherTaxValue);
    const newTaxValue = {
      taxPercent,
      total: totalCost,
      taxValue: e.target.value
    }
    onBulkForm(newTaxValue);
  }

  const onOtherTaxPercentChange = e => {
    const taxOther = validFloat((e.target.value * (subtotal - discountValue)) / 100);
    const totalCost = validFloat(subtotal - discountValue) + validFloat(taxValue) + validFloat(taxOther);
    const newTaxPercent = {
      otherTaxValue: taxOther,
      total: totalCost,
      otherTaxPercent: e.target.value
    }
    onBulkForm(newTaxPercent);
  }

  const onOtherTaxValueChange = e => {
    const taxOtherValue = validFloat(e.target.value);
    const taxOtherPercent = validFloat((taxOtherValue * 100) /  (subtotal - discountValue));
    const totalCost = validFloat(subtotal - discountValue) + validFloat(taxValue) + validFloat(taxOtherValue);
    const newTaxValue = {
      otherTaxPercent: taxOtherPercent,
      total: totalCost,
      otherTaxValue: e.target.value
    }
    onBulkForm(newTaxValue);
  }

  const fnGetDataServices = () => {
    setLoading(true);
    request.GET(`hotel/process/bookingCharges?bookingId=${bookingId}`, (resp) => {
      const bookingCharges = resp.data.map((item) => {
        item.service = item?.serviceData?.name || ""
        item.priceTotal = validFloat(item.price) + validFloat(item.price * (item.taxPercent/100))
        return item;
      });
      setDataServices(bookingCharges);
      const sumTotal = bookingCharges.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
      setTotalValServices(sumTotal);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetDataPayments = () => {
    setLoading(true);
    request.GET(`hotel/process/bookingPayments?bookingId=${bookingId}`, (resp) => {
      const bookingPayments = resp.data.map((item) => {
        item.type = item?.paymentTypeData?.name || ""
        return item;
      });
      setDataPayments(bookingPayments);
      const sumTotal = bookingPayments.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
      setTotalValPayments(sumTotal);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if(validInt(documentType) === 1){
      setOpenModalGenerateInvoice(true);
    }else{
      const invoiceData = {
        documentCode,
        bookingId,
        cashId,
        cashierId,
        invoiceDate,
        billingToCompany,
        isCredit: documentType===1? false : true,
        creditDays,
        detailRoom:{
          roomId,
          qty: validFloat(qty),
          price: validFloat(price),
          subtotal: validFloat(subtotal),
          discountPercent: validFloat(discountPercent),
          discountValue: validFloat(discountValue),
          taxPercent: validFloat(taxPercent),
          taxValue: validFloat(taxValue),
          otherTaxPercent: validFloat(otherTaxPercent),
          otherTaxValue: validFloat(otherTaxValue),
          total: validFloat(total)
        },
        totalCustomer: 0,
        totalRest: 0,
      }

      const data = {
        invoiceData,
        paymentData: []
      }

      setLoading(true);
      request.POST('hotel/process/bookings/generateInvoice', data, (resp) => {
        setOpen(false);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    request.GET('admin/paymentTypes/getForCustomers', (resp) => {
      const paymentTypes = resp.data.map((item) => {
        item.value= 0
        item.reference = ""
        return item
      });
      setListTypePayments(paymentTypes);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

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

    request.GET('admin/users?status=1', (resp) => {
      const users = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode,
          isSeller: item.isSeller,
          isCashier: item.isCashier,
          name: item.name
        }
      });
      const cashiers = users.filter((item) => {
        return item.isCashier === true
      });
      setListCashiers(cashiers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('billing/settings/cashRegisters?status=1', (resp) => {
      const cashRegisters = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListCashBoxes(cashRegisters);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

  }, []);

  useEffect(()=>{
    if(validInt(bookingId)>0){
      fnGetDataServices();
      fnGetDataPayments();
    }
  },[bookingId]);

  useEffect(() => {
    const date1 = moment(checkInDate);
    const date2 = moment(checkOutDate);
    const daysDiff = date2.diff(date1, 'days');

    const newPrice = {
      price: baseRate,
      qty: daysDiff,
      subtotal: baseRate,
      total: baseRate
    }
    onBulkForm(newPrice);
  }, [baseRate]);

  return (
    {
      totalValServices,
      totalValPayments,
      listTypePayments,
      listCashBoxes,
      listCashiers,
      listTypeDocuments,
      dataServices,
      dataPayments,
      formState,
      formValidation,
      onInputChange,
      onPriceChange,
      onQtyChange,
      onDiscountPercentChange,
      onDiscountValueChange,
      onTaxPercentChange,
      onTaxValueChange,
      onOtherTaxPercentChange,
      onOtherTaxValueChange,
      sendForm,
      openModalGenerateInvoice,
      setOpenModalGenerateInvoice,
      setListTypePayments,
      fnSave
    }
  )
}
