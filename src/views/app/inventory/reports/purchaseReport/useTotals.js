import { useForm } from '@/hooks'

export const useTotals = () => {

  const { formState: formStateTotals, formValidation: formValidationTotals, isFormValid: isFormValidTotals, onInputChange: onInputChangeTotals, onResetForm: onResetFormTotals, onBulkForm: onBulkFormTotals } = useForm({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  return (
    {
      formStateTotals,
      onInputChangeTotals
    }
  )
}
