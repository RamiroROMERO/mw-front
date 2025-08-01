import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useState } from 'react'

export const useRetentionDetail = ({ setLoading, setRetentionDetail }) => {
  const [sendFormDeta, setSendFormDeta] = useState(false);

  const validRetentionDetail = {
    documentCode: [(val) => val !== "", "msg.required.input.codeDocument"],
    description: [(val) => val !== "", "msg.required.select.description"],
  }

  const { formState: formDetail, setBulkForm: setBulkFormDetail, onInputChange: onInputDetaChange, onResetForm: onResetFormDetail, formValidation: formValidationDetail, isFormValid: isFormValidDeta } = useForm({
    id: 0,
    documentCode: '',
    description: '',
    baseValue: '',
    percentValue: '',
    totalValue: '',
  }, validRetentionDetail)

  const fnViewOrderDetail = (receipId) => {
    setLoading(true);
    setSendFormDeta(false);
    request.GET(`tax/process/withholdingReceiptDetail?fatherId=${receipId}`, (resp) => {
      const receipts = resp.data;
      setRetentionDetail(receipts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      formDetail,
      setBulkFormDetail,
      onInputDetaChange,
      onResetFormDetail,
      formValidationDetail,
      isFormValidDeta,
      fnViewOrderDetail,
      sendFormDeta,
      setSendFormDeta,
    }
  )
}
