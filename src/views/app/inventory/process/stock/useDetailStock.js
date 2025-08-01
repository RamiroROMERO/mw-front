import { useForm } from '@/hooks'

export const useDetailStock = () => {

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, onBulkForm: onBulkFormDeta } = useForm({
    id: 0,
    currentExistence: 0,
    totalInputs: 0,
    totalOutputs: 0,
    maximumCost: 0,
    minimumCost: 0,
    averageCost: 0,
    currentCost: 0
  });

  return (
    {
      formStateDeta,
      onInputChangeDeta
    }
  )
}
