import React, { useState, useEffect } from 'react'
import { IntlMessages } from '@/helpers/Utils';
import Content from './Content'
import { request } from '@Helpers/core';
import { PATH_FILES } from '/src/helpers/pathFiles';
import ViewPdf from '@Components/ViewPDF/ViewPdf';
import Modal from '@/components/modal';

const UploadFile = ({ filePath, setFilePath }) => {
  const [icon, setIcon] = useState('large-icon bi bi-cloud-upload');
  const [nameFile, setNameFile] = useState(IntlMessages("button.upload"));
  const [openViewFile, setOpenViewFile] = useState(false);
  const [showButtonView, setShowButtonView] = useState('none');

  const [documentPath, setDocumentPath] = useState("");

  const onFileChange = event => {
    const fileUploaded = event.target.files[0];
    const datafile = [{
      file: fileUploaded,
      name: fileUploaded.name
    }];

    request.uploadFiles(PATH_FILES.POST.FILES, datafile, resp => {
      const pathFile = resp.data[0].name;
      setIcon('large-icon bi bi-check2-circle');
      setNameFile(fileUploaded.name);
      setFilePath(pathFile);
    }, err => { console.log(err) });
  }

  const fnViewFile = async() => {
    if (filePath !== "") {
      const name = filePath;
      const imageUrl = `${PATH_FILES.GET.FILES}${name}`;
      const pdfURL = await request.getFile(imageUrl);

      setDocumentPath(pdfURL);
      setOpenViewFile(true);
    }
  }

  const propsToContent = {
    onFileChange,
    fnViewFile,
    icon,
    nameFile,
    showButtonView
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.title",
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'lg',
    data: {
      documentPath
    }
  }

  useEffect(() => {
    if (filePath === "") {
      setIcon('large-icon bi bi-cloud-upload');
      setNameFile("Subir Archivos");
      setShowButtonView('none');
    } else {
      setIcon('large-icon bi bi-folder-check');
      setNameFile("Ver Archivo");
      setShowButtonView('block');
    }
  }, [filePath]);

  return (
    <>
      <Content {...propsToContent} />
      <Modal {...propsToViewPDF}/>
    </>
  )
}

export default UploadFile