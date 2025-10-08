import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react'

export const useModalNewCust = ({currentItem, setLoading, fnGetData, setOpen, setListMunicipalities}) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    rtn: [(val) => val.length > 4, "msg.required.input.rtn"],
    nomcli: [(val) => val.length > 4, "msg.required.input.name"],
    tel: [(val) => val.length > 4, "msg.required.input.phone"],
    deptoCode: [(val) => val.length > 0, "msg.required.select.department"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    rtn: currentItem?.rtn || "",
    nomcli: currentItem?.nomcli || "",
    tel: currentItem?.tel || "",
    email: currentItem?.email || "",
    deptoCode: currentItem?.deptoCode || "",
    municCode: currentItem?.municCode || "",
    direcc: currentItem?.direcc || "",
    status: currentItem?.status || true
  }, validation);

  const {deptoCode, municCode} = formState;

  const onDeptoChange = ({ target }) => {
    setListMunicipalities([]);
    const { value } = target;
    onBulkForm({deptoCode: value, municCode: ""});
  }

  const fnGetMunic = (deptoCode) => {
    request.GET(`admin/locateMunic/getSL?codeDepto=${deptoCode}`, resp => {
      const listMunic = resp.data.map(item => {
        return {
          value: item.code,
          label: item.name
        }
      });
      setListMunicipalities(listMunic);
      if(municCode!==""){
        onBulkForm({municCode: municCode});
      }
    }, err => console.error(err))

  }

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if(formState.id === 0){
      setLoading(true);
      request.POST('facCustomers', formState, (resp) => {
        fnGetData();
        setOpen(false);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });

    }else{
      setLoading(true);
      request.PUT(`facCustomers/${formState.id}`, formState, () => {
        fnGetData();
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(()=>{
    fnGetMunic(deptoCode);
  },[deptoCode]);

  return (
    {
      formState,
      formValidation,
      onInputChange,
      onDeptoChange,
      sendForm,
      fnSave
    }
  )
}
