import { API_URLS } from '@/helpers/APIUrl';
import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { RandomCodeGenerator } from '@/helpers/UuIdGenerator';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react'
import moment from 'moment';
import createNotification from "@/containers/ui/Notifications";

export const useModalNewQuote = ({ currentItem, setLoading, fnGetData, listCustomers, listRooms, setOpen, fnPrintPdf }) => {
  const [sendForm, setSendForm] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [detailQuote, setDetailQuote] = useState([]);
  const [currentDetail, setCurrentDetail] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const validation = {
    date: [(val) => val !== "", "msg.required.input.date"],
    name: [(val) => val !== "", "msg.required.select.customer"],
    checkInDate: [(val) => val !== "", "msg.required.input.checkInDate"],
    checkOutDate: [(val) => val !== "", "msg.required.input.checkOutDate"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    date: currentItem?.date || "",
    customerId: currentItem?.customerId || 0,
    dni: currentItem?.dni || 0,
    name: currentItem?.name || "",
    phone: currentItem?.phone || "",
    email: currentItem?.email || "",
    checkInDate: currentItem?.checkInDate || "",
    checkOutDate: currentItem?.checkOutDate || "",
    subtotal: currentItem?.subtotal || 0,
    percentDiscount: currentItem?.percentDiscount || 0,
    discount: currentItem?.discount || 0,
    percentTax1: currentItem?.percentTax1 || 15,
    valueTax1: currentItem?.valueTax1 || 0,
    percentTax2: currentItem?.percentTax2 || 4,
    valueTax2: currentItem?.valueTax2 || 0,
    total: currentItem?.total || 0,
    usdChange: currentItem?.usdChange || 0
  }, validation);

  const validationDeta = {
    roomId: [(val) => validFloat(val) > 0, "msg.required.select.room"],
    qtyNight: [(val) => validFloat(val) > 0, "msg.required.input.totalNights"],
    qtyRooms: [(val) => validFloat(val) > 0, "msg.required.input.qtyRooms"]
  }

  const { formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, onBulkForm: onBulkFormDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta } = useForm({
    id: currentDetail?.id || 0,
    idFather: currentDetail?.idFather || 0,
    roomId: currentDetail?.roomId || 0,
    qtyNight: currentDetail?.qtyNight || 1,
    qtyRooms: currentDetail?.qtyRooms || 1,
    priceUsd: currentDetail?.priceUsd || 0,
    priceLps: currentDetail?.priceLps || 0,
    subtotalUsd: currentDetail?.subtotalUsd || 0,
    subtotalLps: currentDetail?.subtotalLps || 0,
    notes:  currentDetail?.notes || "",
  }, validationDeta);

  const {id, customerId, checkInDate, checkOutDate, subtotal, percentDiscount, discount, percentTax1, valueTax1, percentTax2, valueTax2, usdChange} = formState;

  const {roomId, qtyNight, qtyRooms, priceUsd, priceLps, subtotalUsd, subtotalLps, notes} = formStateDeta;

  const onQtyNightChange = e => {
    const valueQtyNight = e.target.value;

    const subtotal1 = validFloat(priceLps) * validFloat(valueQtyNight) * validFloat(qtyRooms);
    const subtotal2 = validFloat(priceUsd) * validFloat(valueQtyNight) * validFloat(qtyRooms);

    const newValues = {
      qtyNight: valueQtyNight,
      subtotalLps: subtotal1,
      subtotalUsd: subtotal2
    }

    onBulkFormDeta(newValues);
  }

  const onQtyRoomsChange = e => {
    const valueQtyRooms = e.target.value;

    const subtotal1 = validFloat(priceLps) * validFloat(qtyNight) * validFloat(valueQtyRooms);
    const subtotal2 = validFloat(priceUsd) * validFloat(qtyNight) * validFloat(valueQtyRooms);

    const newValues = {
      qtyRooms: valueQtyRooms,
      subtotalLps: subtotal1,
      subtotalUsd: subtotal2
    }

    onBulkFormDeta(newValues);
  }

  const onPriceLpsChange = e => {
    const valuePriceLps = e.target.value;

    const subtotal1 = validFloat(valuePriceLps) * validFloat(qtyNight) * validFloat(qtyRooms);
    const valueUsd = validFloat(valuePriceLps) / validFloat(usdChange);

    const newValues = {
      priceLps: valuePriceLps,
      priceUsd: validFloat(valueUsd,2),
      subtotalLps: subtotal1,
    }

    onBulkFormDeta(newValues);
  }

  const onPriceUsdChange = e => {
    const valuePriceUsd = e.target.value;

    const subtotal2 = validFloat(valuePriceUsd) * validFloat(qtyNight) * validFloat(qtyRooms);

    const newValues = {
      priceUsd: valuePriceUsd,
      subtotalUsd: subtotal2,
    }

    onBulkFormDeta(newValues);
  }

  const onUsdChange = e => {
    const valueUsd = validFloat(priceLps) / validFloat(e.target.value);
    const subtotal2 = validFloat(valueUsd) * validFloat(qtyNight) * validFloat(qtyRooms);

    const newValues = {
      priceUsd: validFloat(valueUsd, 2),
      subtotalUsd: subtotal2
    }

    onBulkForm({usdChange: e.target.value});
    onBulkFormDeta(newValues);
  }

  const onCheckInDate = e => {
    const dateValue = e.target.value;

    const date1 = moment(dateValue);
    const date2 = moment(checkOutDate);
    const daysDiff = date2.diff(date1, 'days');

    const newInDate = {
      checkInDate: dateValue
    }
    onBulkForm(newInDate);
    onBulkFormDeta(
      { qtyNight: validInt(daysDiff) }
    );
  }

  const onCheckOutDate = e => {
    const dateValue = e.target.value;

    const date1 = moment(checkInDate);
    const date2 = moment(dateValue);
    const daysDiff = date2.diff(date1, 'days');

    const newOutDate = {
      checkOutDate: dateValue
    }
    onBulkForm(newOutDate);
    onBulkFormDeta(
      { qtyNight: validInt(daysDiff) }
    );
  }

  const onDiscountPercentChange = e => {
    const discountValue = validFloat((e.target.value * subtotal) / 100);
    const tax = validFloat((percentTax1 * (subtotal - discountValue)) / 100);
    const otherTax = validFloat((percentTax2 * (subtotal - discountValue)) / 100);
    const totalCost = validFloat(subtotal - discountValue) + validFloat(tax) + validFloat(otherTax);
    const newDiscount = {
      discount: discountValue,
      valueTax1: tax,
      valueTax2: otherTax,
      total: totalCost,
      percentDiscount: e.target.value
    }
    onBulkForm(newDiscount);
  }

  const onTaxPercentChange = e => {
    const tax = validFloat((e.target.value * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(tax) + validFloat(valueTax2);
    const newTaxPercent = {
      valueTax1: tax,
      total: totalCost,
      percentTax1: e.target.value
    }
    onBulkForm(newTaxPercent);
  }

  const onOtherTaxPercentChange = e => {
    const taxOther = validFloat((e.target.value * (subtotal - discount)) / 100);
    const totalCost = validFloat(subtotal - discount) + validFloat(valueTax1) + validFloat(taxOther);
    const newTaxPercent = {
      valueTax2: taxOther,
      total: totalCost,
      percentTax2: e.target.value
    }
    onBulkForm(newTaxPercent);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if(detailQuote.length === 0){
      createNotification('warning', 'msg.required.detailQuote.quoteHotel', 'alert.warning.title');
      return
    }

    if (validInt(id) === 0) {
      setLoading(true);
      request.POST(API_URLS.HOTEL_PROC_QUOTES, formState, (resp) => {
        // guardar el detalle de la cotizacion
        detailQuote.forEach(item => {
          const data = {
            idFather: resp.data.id,
            ...item
          }

          setLoading(true);
          request.POST(API_URLS.HOTEL_PROC_QUOTE_DETAIL, data, (resp) => {
            setLoading(false);
          }, (err) => {

            setLoading(false);
          }, false);

        });

        fnGetData();
        setOpen(false);
        setDetailQuote([]);
        fnPrintPdf(resp.data);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`${API_URLS.HOTEL_PROC_QUOTES}/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnViewDetail = () => {
    setLoading(true);
    request.GET(`${API_URLS.HOTEL_PROC_QUOTE_DETAIL}?idFather=${id}`, (resp) => {
      const data = resp.data.map(item => {
        item.roomName = item?.roomData?.typeData?.name || ""
        return item
      });
      setDetailQuote(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnAddDetail = () => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    if(id>0){
      if(formStateDeta.id>0){
        setLoading(true);
        request.PUT(`${API_URLS.HOTEL_PROC_QUOTE_DETAIL}/${formStateDeta.id}`, formStateDeta, () => {
          setLoading(false);
          fnViewDetail();
        }, (err) => {
          setLoading(false);
        });
      }else{
        formStateDeta.idFather = id;
        setLoading(true);
        request.POST(API_URLS.HOTEL_PROC_QUOTE_DETAIL, formStateDeta, (resp) => {
          setLoading(false);
          fnViewDetail();
        }, (err) => {
          setLoading(false);
        }, false);
      }
    }else{
      const filterRooms = listRooms.find(item => item.id === roomId);

      const tempCode = RandomCodeGenerator();
      const newItem = {
        id: tempCode,
        roomId,
        roomName: filterRooms?.label || "",
        qtyNight,
        qtyRooms,
        priceUsd,
        priceLps,
        subtotalUsd,
        subtotalLps,
        notes
      }

      setDetailQuote([...detailQuote, newItem]);
    }

    onResetFormDeta();
    setSendFormDeta(false);
  }

  const fnDeleteDetail = (item) => {
    setCurrentDetail({id: item.id});
    setOpenMsgDelete(true);
  }

  const fnOkDeleteDetail = () => {
    if(id>0){
      setLoading(true);
      request.DELETE(`${API_URLS.HOTEL_PROC_QUOTE_DETAIL}/${currentDetail.id}`, () => {
        fnViewDetail();
        setCurrentDetail({});
        setOpenMsgDelete(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }else{
      const filterDetail = detailQuote.filter(item => item.id !== currentDetail.id);

      setDetailQuote(filterDetail);
      setOpenMsgDelete(false);
    }
  }

  const fnEditDetail = (item) => {
    onBulkFormDeta(item);
  }

  useEffect(() => {
    if(validInt(customerId)>0){
      const filter = listCustomers.find(item => item.id === customerId);

      const newCust = {
        dni: filter?.rtn || "",
        name: filter?.name || "",
        phone: filter?.phone || "",
        email: filter?.email || ""
      }

      onBulkForm(newCust);
    }
  }, [customerId]);

  useEffect(() => {
    const filterRooms = listRooms.find(item => item.id === roomId);
    const rate = filterRooms?.rate || 0
    const subtotal = rate * qtyNight * qtyRooms;
    const valueUsd = validFloat(usdChange)>0 ? rate / validFloat(usdChange) : priceUsd;
    const subtotalUSD = valueUsd * qtyNight * qtyRooms;

    const date1 = moment(checkInDate);
    const date2 = moment(checkOutDate);
    const daysDiff = date2.diff(date1, 'days');

    const newRoom = {
      qtyNight: daysDiff,
      priceLps: filterRooms?.rate || 0,
      subtotalLps: subtotal,
      priceUsd: valueUsd,
      subtotalUsd: subtotalUSD
    }

    onBulkFormDeta(newRoom);
  }, [roomId]);

  useEffect(() => {
    //actualizar totales
    const subtotalLpsQuote = detailQuote.map(item => validFloat(item.subtotalLps)).reduce((prev, curr) => prev + curr, 0);

    const discountValue = validFloat((percentDiscount * subtotalLpsQuote) / 100);
    const tax = validFloat((percentTax1 * (subtotalLpsQuote - discount)) / 100);
    const otherTax = validFloat((percentTax2 * (subtotalLpsQuote - discount)) / 100);
    const totalCost = validFloat(subtotalLpsQuote - discount) + validFloat(tax) + validFloat(otherTax);

    const newTotals = {
      subtotal: subtotalLpsQuote,
      discount: discountValue,
      valueTax1: tax,
      valueTax2: otherTax,
      total: totalCost
    }

    onBulkForm(newTotals);

  }, [detailQuote]);

  useEffect(() => {
    if(validInt(id)>0){
      fnViewDetail();
    }
  }, [id]);

  const propsToMsgDeleteDetail = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnOkDeleteDetail,
    title: "alert.question.title",
    fnOnNo: () => setCurrentDetail({})
  }

  return (
    {
      detailQuote,
      formState,
      formValidation,
      onInputChange,
      sendForm,
      formStateDeta,
      formValidationDeta,
      onInputChangeDeta,
      onQtyNightChange,
      onQtyRoomsChange,
      onPriceLpsChange,
      onPriceUsdChange,
      onUsdChange,
      onDiscountPercentChange,
      onTaxPercentChange,
      onOtherTaxPercentChange,
      onCheckInDate,
      onCheckOutDate,
      sendFormDeta,
      fnSave,
      fnAddDetail,
      fnEditDetail,
      fnDeleteDetail,
      propsToMsgDeleteDetail
    }
  )
}
