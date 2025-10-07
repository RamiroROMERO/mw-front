import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useState } from 'react'

export const useModalAddService = ({bookingId, currentService, setLoading, fnGetDataServices, listServices, setOpen}) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    date: [(val) => val !== "", "msg.required.input.date"],
    serviceId: [(val)=>validFloat(val)>0, "msg.required.select.service"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentService?.id || 0,
    bookingId: currentService?.bookingId || bookingId,
    serviceId: currentService?.serviceId || 0,
    date: currentService?.date || "",
    notes: currentService?.notes || "",
    qty: currentService?.qty || 0,
    price: currentService?.price || 0,
    subtotal: currentService?.subtotal || 0,
    taxPercent: currentService?.taxPercent || 0,
    tax: currentService?.tax || 0,
    total: currentService?.total || 0
  }, validation);

  const {id, qty, price, subtotal, taxPercent} = formState;

  const onServiceChange = e => {
    const service = validInt(e.target.value);

    const filter = listServices.find(item => item.value === service);

    onBulkForm({
      serviceId: service,
      price: filter.priceLocalMid,
      taxPercent: filter.percentLocalPriceMid
    });
  }

  const onQtyChange = e => {
    const qtyVal = e.target.value;

    const subtotalVal = (validFloat(qtyVal) * validFloat(price));
    const taxValue = (subtotalVal * taxPercent)/100;
    const totalVal = subtotalVal + taxValue;

    onBulkForm({
      qty: qtyVal,
      subtotal: subtotalVal,
      tax: taxValue,
      total: totalVal
    });
  }

  const onTaxPercentChange = e => {
    const taxPercentVal = e.target.value;

    const taxValue = (qty * validFloat(taxPercentVal))/100;
    const totalVal = subtotal + taxValue;

    onBulkForm({
      taxPercent: taxPercentVal,
      tax: taxValue,
      total: totalVal
    })
  }

  const onTaxChange = e => {
    const taxVal = e.target.value;

    const taxPercentVal = (validFloat(taxVal) * 100)/ validFloat(subtotal);
    const totalVal = subtotal + validFloat(taxVal);

    onBulkForm({
      taxPercent: taxPercentVal,
      tax: taxVal,
      total: totalVal
    })
  }

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if (validInt(id) === 0) {
      setLoading(true);
      request.POST('hotel/process/bookingCharges', formState, (resp) => {
        const {data} = resp;
        onBulkForm(data);
        setLoading(false);
        fnGetDataServices();
        setOpen(false);
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      setLoading(true);
      request.PUT(`hotel/process/bookingCharges/${id}`, formState, () => {
        setLoading(false);
        fnGetDataServices();
        setOpen(false);
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      onInputChange,
      onServiceChange,
      onQtyChange,
      onTaxPercentChange,
      onTaxChange,
      fnSave
    }
  )
}
