import { request } from '@/helpers/core';
import { validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks'
import React, { useEffect, useState } from 'react'

export const useModalNewCustomer = ({ setLoading, setOpen, setCustomer }) => {

  const [sendForm, setSendForm] = useState(false);
  const [listCustomerTypes, setListCustomerTypes] = useState([]);

  const newCustomerValidation = {
    customerTypeId: [(val) => validInt(val) > 0, ""],
    customerName: [(val) => val.length > 5, ""],
    customerCode: [val => val.length >= 13, ""]
  }

  const { formState, formValidation, onInputChange, isFormValid } = useForm({
    customerTypeId: 0,
    customerCode: "",
    customerName: "",
    phone: "",
    email: "",
    address: ""
  }, newCustomerValidation);


  const getDataSelect = () => {
    setLoading(true);
    request.GET('admin/customerTypes/getSL', resp => {
      const { data } = resp;
      setListCustomerTypes(data);
      console.info(data);
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    })
  }

  const fnSaveCustomer = () => {

    // console.log('save customer!');
    setSendForm(true);
    if (!isFormValid) return;

    let currentDate = new Date().toJSON().substring(0, 10);

    const { customerTypeId, customerCode, customerName, phone, email, address } = formState;

    const data = {
      fechai: currentDate,
      rtn: customerCode,
      nomcli: customerName,
      tel: phone,
      direcc: address,
      correoc: email,
      idTypeCont: customerTypeId
    };
    setLoading(true);
    request.POST('billing/settings/customers', data, resp => {
      const { data } = resp;
      setLoading(false);
      setCustomer(data);
      setOpen(false);
    }, err => {
      console.error(err)
      setLoading(false);
    });
  }

  useEffect(() => {
    getDataSelect()
  }, []);

  return {
    formState,
    formValidation,
    onInputChange,
    sendForm,
    listCustomerTypes,
    fnSaveCustomer
  }
}
