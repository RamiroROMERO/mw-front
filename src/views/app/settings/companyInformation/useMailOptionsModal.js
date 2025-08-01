import { validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import React, { useEffect } from 'react'

export const useMailOptionsModal = ({data, setOpen }) => {
  const { companyId, setLoading } = data;
  const { formState, onInputChange, onBulkForm } = useForm({
    id: 0,
    companyId,
    mailServer: "",
    mailPort: "",
    mailSsl: false,
    mailEmail: "",
    mailUser: "",
    mailPass: "",
    mailCopy1: "",
    mailCopy2: "",
    mailCopy3: "",
    sendMailGenInvoice: false,
    sendMailGenOC: false,
    sendMailGenProvPayment: false
  });

  useEffect(() => {
    setLoading(true);
    const url = `admin/companyInternalSettings?companyId=${companyId}`;
    request.GET(url, resp => {
      const { data } = resp;
      let intData = {}
      if (data.length > 0) intData = data[0];
      if (intData.id) {
        onBulkForm(intData);
      }
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  const fnSaveIntOptions = () => {
    setLoading(true);
    if (validInt(formState.id) === 0) {

      request.POST('admin/companyInternalSettings', formState, res => {
        setOpen(false);
        setLoading(false);
      }, err => {
        console.log(err)
        setOpen(false);
        setLoading(false);
      });
    } else {
      request.PUT(`admin/companyInternalSettings/${formState.id}`, formState, res => {
        setOpen(false)
        setLoading(false);
      }, err => {
        console.log(err)
        setOpen(false)
        setLoading(false);
      })
    }
  }

  return {
    formState, onInputChange, fnSaveIntOptions
  }
}
