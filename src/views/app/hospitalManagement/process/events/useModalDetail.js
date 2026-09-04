import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';

export const useModalDetail = ({ setLoading, currentItem }) => {
  const [openModalAddProduct, setOpenModalAddProduct] = useState(false);
  const [openModalAddService, setOpenModalAddService] = useState(false);
  const [openModalEditProduct, setOpenModalEditProduct] = useState(false);
  const [openModalEditService, setOpenModalEditService] = useState(false);
  const [currentDetailItem, setCurrentDetailItem] = useState({});
  const [idRecordToDelete, setIdRecordToDelete] = useState(0);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const fnEditItem = (item) => {
    // Materia Prima queda pendiente de implementar.
    if (item.invProduct?.type === 1) {
      setCurrentDetailItem(item);
      setOpenModalEditProduct(true);
    } else if (item.invProduct?.type === 2) {
      setCurrentDetailItem(item);
      setOpenModalEditService(true);
    }
  }

  const fnDeleteItem = (item) => {
    setIdRecordToDelete(item.id);
    setOpenMsgQuestion(true);
  }

  const fnOkDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(idRecordToDelete) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`hospital/process/eventDetails/${idRecordToDelete}`, (resp) => {
      setLoading(false);
      setIdRecordToDelete(0);
      fnGetDataDetail();
    }, (err) => {
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("table.column.code"), dataField: "productCode", headerStyle: { 'width': '12%' } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { 'width': '28%' } },
      { text: IntlMessages("table.column.type"), dataField: "typeName", headerStyle: { 'width': '12%' } },
      { text: IntlMessages("table.column.qty"), dataField: "quantity", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.price"), dataField: "price", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': '10%' } }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [
      {
        color: 'warning',
        icon: 'pencil',
        onClick: fnEditItem,
        toolTip: IntlMessages("button.edit")
      },
      {
        color: 'danger',
        icon: 'trash',
        onClick: fnDeleteItem,
        toolTip: IntlMessages("button.delete")
      }
    ]
  });

  const fnGetDataDetail = () => {
    setLoading(true);
    request.GET(buildUrl('hospital/process/eventDetails', { fatherId: currentItem.id }), (resp) => {
      const data = resp.data.map((item) => {
        item.description = item.invProduct?.name || '';
        item.typeName = item.invProduct?.type === 1 ? 'Producto' : (item.invProduct?.type === 2 ? 'Servicio' : 'Materia Prima')
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnSaveEditProduct = (formState) => {
    const { id, quantity, price, discPercent, discount, taxPercent, taxValue, total } = formState;
    setLoading(true);
    request.PUT(`hospital/process/eventDetails/${id}`, { quantity, price, discPercent, discount, taxPercent, taxValue, total }, (resp) => {
      setLoading(false);
      setOpenModalEditProduct(false);
      fnGetDataDetail();
    }, (err) => {
      setLoading(false);
    });
  }

  const fnAddProduct = () => {
    setOpenModalAddProduct(true);
  }

  const fnAddService = () => {
    setOpenModalAddService(true);
  }

  const fnPrintDocument = () => {
    setLoading(true);
    const dataPrint = {
      idPatientFile: currentItem.fatherId,
      idEvent: currentItem.id
    }
    request.GETPdf('hospital/process/expedients/exportPDFFileEvent', dataPrint, 'Registro de Atencion.pdf', (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetDataDetail();
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDelete,
    fnOnNo: () => { setIdRecordToDelete(0) }
  };

  return (
    {
      table,
      fnAddProduct,
      fnAddService,
      fnPrintDocument,
      openModalAddProduct,
      setOpenModalAddProduct,
      openModalAddService,
      setOpenModalAddService,
      openModalEditProduct,
      setOpenModalEditProduct,
      openModalEditService,
      setOpenModalEditService,
      currentDetailItem,
      fnSaveEditProduct,
      propsToMsgDelete,
      fnGetDataDetail
    }
  )
}
