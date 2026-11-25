import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { detailPath, isClosed, buildUpdatePayload, validateUpdate } from './eventDetailRules';
import notification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { printEventOptions } from '../patientFiles/patientRules';

export const useModalDetail = ({ setLoading, currentItem }) => {
  const [openModalAddProduct, setOpenModalAddProduct] = useState(false);
  const [openModalAddService, setOpenModalAddService] = useState(false);
  const [openModalEditProduct, setOpenModalEditProduct] = useState(false);
  const [openModalEditService, setOpenModalEditService] = useState(false);
  const [currentDetailItem, setCurrentDetailItem] = useState({});
  const [idRecordToDelete, setIdRecordToDelete] = useState(0);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, tax: 0, total: 0, advances: 0, balance: 0 });
  const [canEditPrice, setCanEditPrice] = useState(false);
  // Los consumos llevan el área de FACTURACIÓN de hospital (`fac_areasfact` con la marca de hospital), no el área de ingreso del evento.
  const [listBillingAreas, setListBillingAreas] = useState([]);
  // Un evento cerrado no admite cambios en sus consumos (el back lo rechaza igual).
  const closed = isClosed(currentItem);

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
    request.DELETE(`${detailPath(currentItem)}/${idRecordToDelete}`, (resp) => {
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
    request.GET(buildUrl(detailPath(currentItem), { fatherId: currentItem.id }), (resp) => {
      const data = resp.data.map((item) => {
        item.typeName = item.productType === 1 ? 'Producto' : (item.productType === 2 ? 'Servicio' : 'Materia Prima')
        item.invProduct = { name: item.description, type: item.productType };
        return item;
      });
      setTable((prev) => ({ ...prev, data, actions: closed ? [] : prev.actions }));
      setLoading(false);
    }, err => {
      setLoading(false);
    });
    // Total consumo, adelantos sin cerrar del paciente y lo que falta por pagar: los calcula el back.
    request.GET(buildUrl(`${detailPath(currentItem)}/totals`, { fatherId: currentItem.id }), (resp) => setTotals(resp.data), () => {});
  }

  const fnSaveEditProduct = (formState) => {
    const { id } = formState;
    if (Object.keys(validateUpdate(formState, canEditPrice)).length) {
      notification('warning', 'page.events.msg.quantityInvalid', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.PUT(`${detailPath(currentItem)}/${id}`, buildUpdatePayload(formState, canEditPrice), (resp) => {
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

  // El registro de atención se imprime por GET desde lo guardado (SPEC v2-150-sr); la ruta vieja `exportPDFFileEvent` ya no existe.
  const fnPrintDocument = () => {
    printDocument({ ...printEventOptions(currentItem.fatherId, currentItem.id), setLoading });
  }

  useEffect(() => {
    fnGetDataDetail();
    request.GET(`${detailPath(currentItem)}/settings`, (resp) => setCanEditPrice(Boolean(resp.data?.canEditPrice)), () => {});
    request.GET('admin/areas/getSL?isHospital=1', (resp) => setListBillingAreas(resp.data.map((item) => ({ ...item, value: item.id, label: item.name }))), () => {});
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
      totals,
      listBillingAreas,
      closed,
      canEditPrice,
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
