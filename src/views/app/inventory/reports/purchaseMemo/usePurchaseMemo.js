import { useForm } from '@/hooks'
import { useState } from 'react';

export const usePurchaseMemo = () => {
  const [dataPurchases, setDataPurchases] = useState([]);
  const [dataMemos, setDataMemos] = useState([]);
  const [openModalMemos, setOpenModalMemos] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    date: '',
    nameFor1: '',
    nameFor2: '',
    nameFrom1: '',
    nameFrom2: '',
    subject: '',
    createdBy: '',
    reviewedBy: '',
    total: 0,
    notes: '',
    exportToXls: 0
  });

  const fnMarkReported = () => { }

  const fnAddToReport = () => { }

  const fnPrintPrevious = () => {
    setOpenModalMemos(true);
  }

  const fnDeleteReport = () => { }

  return (
    {
      formState,
      onInputChange,
      fnMarkReported,
      fnAddToReport,
      fnPrintPrevious,
      fnDeleteReport,
      dataPurchases,
      dataMemos,
      openModalMemos,
      setOpenModalMemos
    }
  )
}
