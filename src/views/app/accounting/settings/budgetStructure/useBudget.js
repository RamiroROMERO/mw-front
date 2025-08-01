import { useForm } from '@/hooks'

export const useBudget = () => {

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    idFather: 0,
    yearNo: 0,
    orderId: 0,
    name: '',
    type: '',
    action: '',
    month1: 0,
    month2: 0,
    month3: 0,
    month4: 0,
    month5: 0,
    month6: 0,
    month7: 0,
    month8: 0,
    month9: 0,
    month10: 0,
    month11: 0,
    month12: 0,
    total: 0,
    status: true
  });

  const fnNewDocument = () => { }

  const fnSearchDocument = () => { }

  const fnSaveDocument = () => { }

  const fnPrintDocument = () => { }

  const fnDeleteDocument = () => { }

  const fnExportToExcel = () => { }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      {
        title: "button.export",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExportToExcel
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange
    }
  )
}
