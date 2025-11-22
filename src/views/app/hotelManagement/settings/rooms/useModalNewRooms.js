import { request } from '@/helpers/core';
import { validFloat } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react';

export const useModalNewRooms = ({currentItem, setLoading, listServices, dataRoomServices, fnGetData, setOpen, fnGetRoomImages}) => {
  const [sendForm, setSendForm] = useState(false);
  const [listServicesSelected, setListServicesSelected] = useState([]);
  const [listRoomServices, setRoomServices] = useState([]);
  const [dataImages, setDataImages] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [idImage, setIdImage] = useState(0);

  const validation = {
    typeId: [(val)=>validFloat(val)>0, "msg.required.input.type"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    name: currentItem?.name || "",
    typeId: currentItem?.typeId || 0,
    levelId: currentItem?.levelId || 0,
    bedNumber: currentItem?.bedNumber || 0,
    rate: currentItem?.rate || 0,
    rateCorp: currentItem?.rateCorp || 0,
    notes: currentItem?.notes || "",
    capacity: currentItem?.capacity || "",
    mealPlanId: currentItem?.mealPlanId || 0,
    statusId: currentItem?.statusId || true
  }, validation);

  const onServicesChange = e => {
    const list = listServices.map((item) => {
      if (parseInt(e.target.id, 10) === item.id) {
        item.checked = !item.checked;
      }
      return item;
    });
    setListServicesSelected(list);
  }

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if(formState.id === 0){
      setLoading(true);
      request.POST('hotel/settings/rooms', formState, (resp) => {
        // guardar los servicios
        listServicesSelected.forEach(item => {
          const data = {
            roomId: resp.data.id,
            serviceId: item.id,
            status: item.checked
          }

          setLoading(true);
          request.POST('hotel/settings/roomServices', data, (resp) => {
            setLoading(false);
          },(err)=>{
            console.error(err);
            setLoading(false);
          },false);

        });

        // guardar galeria
        if(dataImages && dataImages.length>0){
            dataImages.forEach(item => {
            const data = {
              roomId: resp.data.id,
              name: item.name
            }

            setLoading(true);
            request.POST('hotel/settings/roomPictures', data, (resp) => {
              setLoading(false);
            },(err)=>{
              console.error(err);
              setLoading(false);
            },false);
          });
        }

        fnGetData();
        setOpen(false);
        setListServicesSelected([]);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });

    }else{
      setLoading(true);
      request.PUT(`hotel/settings/rooms/${formState.id}`, formState, () => {
        // actualizar los servicios
        listServicesSelected.forEach(item => {
          const data = {
            status: item.checked
          }

          setLoading(true);
          request.PUT(`hotel/settings/roomServices/${item.idRoomService}`, data, (resp) => {
            setLoading(false);
          },(err)=>{
            console.error(err);
            setLoading(false);
          },false);
        });

        // guardar galeria
        if(dataImages && dataImages.length>0){
          dataImages.forEach(item => {
            const data = {
              roomId: formState.id,
              name: item.name
            }

            setLoading(true);
            request.POST('hotel/settings/roomPictures', data, (resp) => {
              setLoading(false);
            },(err)=>{
              console.error(err);
              setLoading(false);
            },false);
          });
        }

        fnGetData();
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteImage = (id) => {
    setIdImage(id);
    setOpenMsgQuestion(true);
  }

  const fnConfirmDeleteImg = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`hotel/settings/roomPictures/${idImage}`, () => {
      fnGetRoomImages(currentItem.id);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    if(formState.id===0){
      const newList = listServices.map((item) => {
        item.checked = false;
        item.idRoomService = 0
        return item;
      });
      setRoomServices(newList);
      setListServicesSelected(newList);
    }else{
      const newList = listServices.map((item) => {
      const findService = dataRoomServices.find(item2 => item2.serviceId === item.id);
        if(findService && findService.status===true){
          item.checked = true;
        }else{
          item.checked = false;
        }
        item.idRoomService = findService?.id || 0
        return item;
      });
      setRoomServices(newList);
      setListServicesSelected(newList);
    }
  },[]);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDeleteImg,
    fnOnNo: () => setIdImage(0)
  };

  return (
    {
      formState,
      formValidation,
      listRoomServices,
      onInputChange,
      onServicesChange,
      sendForm,
      propsToMsgDelete,
      setDataImages,
      fnSave,
      fnDeleteImage
    }
  )
}
