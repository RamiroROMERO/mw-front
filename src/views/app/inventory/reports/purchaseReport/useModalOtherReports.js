import { useForm } from '@/hooks'

export const useModalOtherReports = () => {

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    providerId: 0,
    storeId: 0,
    productId: 0,
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
