import { request } from '@/helpers/core';
import { useState } from 'react'

export const useModalImages = ({productCode, fnGetImages, setLoading, setOpen}) => {
  const [imagesUpload, setImagesUpload] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [idImage, setIdImage] = useState(0);

  const fnSave = () => {

    // guardar galeria
    if(imagesUpload && imagesUpload.length>0){
        imagesUpload.forEach(item => {
        const data = {
          productCode,
          name: item.name
        }

        setLoading(true);
        request.POST('inventory/settings/productPictures', data, (resp) => {
          setLoading(false);
        },(err)=>{
          console.error(err);
          setLoading(false);
        });
      });
      setOpen(false);
    }
  }

  const fnDeleteImage = (id) => {
    setIdImage(id);
    setOpenMsgQuestion(true);
  }

  const fnConfirmDeleteImg = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`inventory/settings/productPictures/${idImage}`, () => {
      fnGetImages();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDeleteImg,
    fnOnNo: () => setIdImage(0)
  };

  return (
    {
      propsToMsgDelete,
      setImagesUpload,
      fnSave,
      fnDeleteImage
    }
  )
}
