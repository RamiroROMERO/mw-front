import React from 'react';
import createNotification from '@/containers/ui/Notifications';
import { formatNumber, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useCheckRequestDetail = ({ setLoading }) => {
  const [openModalAccountPayable, setOpenModalAccountPayable] = useState(false);
  const [listCxp, setListCxp] = useState([]);

  const { setBulkForm: setBulkFormDetail, onInputChange: onInputChangeDetail, onResetForm: onResetFormDetail, formState: formStateDetail } = useForm({
    id: 0,
    dateDetail: '',
    idProveedor: '',
    document: '',
    value: '',
    valueOther1: 0,
    otherSurcharges1: '',
    otherSurcharges2: '',
    valueOther2: 0,
    total: 0
  })

  const { id, dateDetail, idProveedor, document, value, otherSurcharges2, valueOther1, otherSurcharges1, valueOther2, total } = formStateDetail;

  const fnViewCxp = () => {

    setOpenModalAccountPayable(true);

  }
  return (
    {
      setBulkFormDetail,
      onInputChangeDetail,
      onResetFormDetail,
      formStateDetail,
      openModalAccountPayable,
      setOpenModalAccountPayable,
      listCxp,
      setListCxp,
      fnViewCxp
    }
  )
}

