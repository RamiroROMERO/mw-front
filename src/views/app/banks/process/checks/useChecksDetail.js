import React, { useState, useEffect } from 'react'
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';

export const useChecksDetail = ({ setLoading }) => {
  const [listAccount, setListLedgerAccount] = useState([]);
  const [sendFormDetail, setSendFormDetail] = useState(false);

  const validCheckDtail = {
    idCtaCont: [(val) => val != '', "msg.required.select.ctaCount"]
  }

  const { onInputChange: onInputChangeDetail, setBulkForm: setBulkFormDetail, formState: formStateDetail, onResetForm: onResetFormDetail, isFormValid: isFormValidDetail, formValidation: formValidationDetail } = useForm({
    id: 0,
    idCtaCont: '',
    valueDebe: 0,
    valueHaber: 0,
    numberLine: 0,
    referenceCode: "",
    customerId: "",
    providerId: "",
    overview: ""
  }, validCheckDtail)

  const { id, idCtaCont, valueDebe, valueHaber, numberLine, referenceCode, customerId, providerId, overview } = formStateDetail;

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccounts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  return (
    {
      onInputChangeDetail,
      onResetFormDetail,
      formStateDetail,
      listAccount,
      isFormValidDetail,
      sendFormDetail,
      setSendFormDetail,
      formValidationDetail
    }
  )
}
