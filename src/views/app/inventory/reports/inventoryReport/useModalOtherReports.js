import { useForm } from '@/hooks'
import React from 'react'

export const useModalOtherReports = () => {

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    storeId: 0,
    dateStart: '',
    dateEnd: '',
    exportToXls: 0,
    typeReport: 0
  });

  const fnPrintOtherReport = () => { }

  return (
    {
      formState,
      onInputChange,
      fnPrintOtherReport
    }
  )
}
