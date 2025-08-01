import { useForm } from '@/hooks'
import { useState } from 'react';

export const useInventoryMemo = () => {
  const [dataMovements, setDataMovements] = useState([]);
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
    notes: ''
  });

  const fnMarkReported = () => { };

  const fnPrintPrevious = () => {
    setOpenModalMemos(true);
  };

  return (
    {
      formState,
      onInputChange,
      fnMarkReported,
      fnPrintPrevious,
      dataMovements,
      dataMemos,
      openModalMemos,
      setOpenModalMemos
    }
  )
}
