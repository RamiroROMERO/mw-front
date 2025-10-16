import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { useState } from 'react'

export const useModalNewCust = ({currentItem, setLoading, fnGetData, setOpen}) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    dni: [(val) => val.length > 4, "msg.required.input.rtn"],
    name: [(val) => val.length > 4, "msg.required.input.name"],
    phone1: [(val) => val.length > 4, "msg.required.input.phone"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    typeId: currentItem?.typeId || 2,
    dni: currentItem?.dni || "",
    name: currentItem?.name || "",
    name2: currentItem?.name2 || "",
    countryId: currentItem?.countryId || "",
    city1: currentItem?.city1 || "",
    city2: currentItem?.city2 || "",
    address: currentItem?.address || "",
    phone1: currentItem?.phone1 || "",
    phone2: currentItem?.phone2 || "",
    email: currentItem?.email || "",
    contact1Name: currentItem?.contact1Name || "",
    contact1Phone: currentItem?.contact1Phone || "",
    contact1Email: currentItem?.contact1Email || "",
    contact2Name: currentItem?.contact2Name || "",
    contact2Phone: currentItem?.contact2Phone || "",
    contact2Email: currentItem?.contact2Email || "",
    haveCredit: currentItem?.haveCredit || false,
    status: currentItem?.status || true
  }, validation);

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if(formState.id === 0){
      setLoading(true);
      request.POST('hotel/settings/customers', formState, (resp) => {
        fnGetData();
        setOpen(false);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });

    }else{
      setLoading(true);
      request.PUT(`hotel/settings/customers/${formState.id}`, formState, () => {
        fnGetData();
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  return (
    {
      formState,
      formValidation,
      onInputChange,
      sendForm,
      fnSave
    }
  )
}
