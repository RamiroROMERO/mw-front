import React, { useEffect } from 'react'
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';

export const useInternalOptions = ({companyId, setLoading, setOpen}) => {

  const { formState, onInputChange, onBulkForm } = useForm({
    id: 0,
    coffeeControl: false,
    farmsConrol: false,
    activitiesControl: false,
    containerControl: false,
    flourControl: false,
    laboratoryControl: false,
    hospitalControl: false,
    closeControl: false,
    sellerMenu: false,
    inventoryMenu: false,
    accountingMenu: false,
    bankMenu: false,
    taxesMenu: false,
    fixedAssetsMenu: false,
    rrhhMenu: false,
    hospitalMenu: false,
    laboratoryMenu: false,
    radiologyMenu: false
  });

  useEffect(() => {
    setLoading(true);
    const url = `admin/companyInternalSettings?companyId=${companyId}`;
    request.GET(url, resp => {
      const { data } = resp;
      let intData = {}
      if (data.length > 0) intData = data[0];
      if (intData.id) {
        onBulkForm(intData);
      }
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  const fnSaveIntOptions = () => {
    setLoading(true);
    if (validInt(formState.id) === 0) {

      request.POST('admin/companyInternalSettings', formState, res => {
        setOpen(false);
        setLoading(false);
      }, err => {
        console.log(err)
        setOpen(false);
        setLoading(false);
      });
    } else {
      request.PUT(`admin/companyInternalSettings/${id}`, formState, res => {
        setOpen(false)
        setLoading(false);
      }, err => {
        console.log(err)
        setOpen(false)
        setLoading(false);
      })
    }
  }

  return (
    {
      formState,
      onInputChange,
      fnSaveIntOptions
    }
  )
}
