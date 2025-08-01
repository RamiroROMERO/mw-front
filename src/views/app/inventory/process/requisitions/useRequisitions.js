import { useForm } from '@/hooks'
import { useState, useEffect } from 'react';
import { request } from '@/helpers/core';
import { validInt } from '@/helpers/Utils';
import moment from 'moment';
import createNotification from '@/containers/ui/Notifications';

export const useRequisitions = ({ requisitionDetail, onResetFormDeta, setRequisitionDetail, setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listTypeApply, setListTypeApply] = useState([]);
  const [listWorkOrders, setListWorkOrders] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataRequisitions, setDataRequisitions] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewRequisitions, setOpenModalViewRequisitions] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [showWorkOrder, setShowWorkOrder] = useState("none");
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validRequisitions = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    assignStoreId: [(val) => validInt(val) > 0, "msg.required.select.destinationId"],
    applyId: [(val) => val !== "", "msg.required.select.applyTo"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: moment(new Date()).format("YYYY-MM-DD"),
    code: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    isWorkOrder: 0,
    workOrderId: 0,
    notes: '',
    userId: userData ? userData.id : 0,
    applicated: 0,
    pdaNumber: '',
    noCtaOrigin: '',
    noCtaAssign: '',
    applyId: '',
    reportId: 0,
    status: true
  }, validRequisitions);

  const { id, documentCode, documentId, date, code, sourceStoreId, assignStoreId, isWorkOrder, workOrderId, notes, userId, applicated, pdaNumber, applyId, status } = formState;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setRequisitionDetail([]);
    setShowWorkOrder("none");
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(`inventory/process/inventoryTransactions?typeName=Requis`, (resp) => {
      const purchases = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : ''
        item.noPhysical = item.code
        return item;
      });
      setDataRequisitions(purchases);
      setOpenModalViewRequisitions(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(`inventory/process/inventoryTransactionDetail?idFather=${idReq}`, (resp) => {
      const requisitionDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      setRequisitionDetail(requisitionDeta);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (requisitionDetail.length === 0) {
      createNotification('warning', 'msg.required.documentDetail', 'alert.warning.title');
      return;
    }

    const typeName = "Requis";

    const newData = {
      documentCode,
      documentId,
      date,
      code,
      sourceStoreId,
      assignStoreId,
      typeName,
      isWorkOrder,
      workOrderId,
      notes,
      userId,
      applicated,
      applyId,
      status
    }

    requisitionDetail.map((item) => {
      delete item.invAssign;
      delete item.invProduct;
      return item;
    });

    if (id === 0) {
      // Generar documento
      setLoading(true);
      request.POST('admin/documents/getCurrentNumber', { code: documentCode }, (resp) => {
        newData.documentId = resp.data.codeInt;
        setLoading(false);

        // Guardar requisición
        setLoading(true);
        request.POST('inventory/process/inventoryTransactions', newData, (resp2) => {
          onBulkForm({ documentId: resp.data.codeInt, id: resp2.data.id });
          setSendForm(false);

          // guardar detalle de la requisicion
          requisitionDetail.forEach(item => {
            const detailReq = {
              idFather: resp2.data.id,
              ...item,
              dateOut: item.dateOut === "" ? "1900-01-01" : item.dateOut
            }
            setLoading(true);
            request.POST('inventory/process/inventoryTransactionDetail', detailReq, () => {
              setLoading(false);
            }, (err) => {
              console.error(err);
              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
      }, (err) => {
        console.error(err);
        setLoading(false);
      }, false);
    } else {
      setLoading(true);
      request.PUT(`inventory/process/inventoryTransactions/${id}`, newData, () => {
        setLoading(false);
        setSendForm(false);
        // Eliminar detalle de la requisicion
        request.DELETE(`inventory/process/inventoryTransactionDetail?idFather=${id}`, () => {
          // guardar detalle de la requisicion
          requisitionDetail.forEach(item => {
            const detailReq = {
              idFather: id,
              ...item,
              dateOut: item.dateOut === "" ? "1900-01-01" : item.dateOut
            }
            setLoading(true);
            request.POST('inventory/process/inventoryTransactionDetail', detailReq, () => {
              setLoading(false);
            }, (err) => {
              console.error(err);
              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        }, false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintDocument = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Requisición.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteDocument = () => {
    if (id > 0) {
      setOpenMsgDeleteDocument(true);
    }
  }

  const fnOkDeleteDocument = () => {
    setOpenMsgDeleteDocument(false);
    setLoading(true);
    request.DELETE(`inventory/process/inventoryTransactions/${id}`, () => {
      onResetForm();
      onResetFormDeta();
      setRequisitionDetail([]);

      // eliminar detalle
      request.DELETE(`inventory/process/inventoryTransactionDetail?idFather=${id}`, () => {
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      }, false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnCount = () => { }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`,
          name: item.name,
          codeInt: item.codeInt
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          type: item.type,
          idCtaInventory: item.idCtaInventory
        }
      });
      const filter1 = stores.filter(item => { return item.type === 1 });
      const filter2 = stores.filter(item => { return item.type === 2 });

      setListStores(filter1);
      setListDestinations(filter2);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET(`accounting/process/workOrders`, (resp) => {
      const orders = resp.data.map((item) => {
        return {
          label: item.description,
          value: item.id,
          idCtaCont: item.idCtaCont
        }
      })
      setListWorkOrders(orders);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccounts(listAccounts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setListTypeApply(
      [
        { id: "Inventario", name: "Inventario" },
        { id: "Costo", name: "Costo" },
        { id: "Gasto", name: "Gasto" }
      ]
    );
  }, [])

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnCount
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange,
      listDocuments,
      listStores,
      listDestinations,
      listTypeApply,
      sendFormDeta,
      setSendFormDeta,
      formValidation,
      sendForm,
      setSendForm,
      isFormValid,
      listWorkOrders,
      onBulkForm,
      showWorkOrder,
      setShowWorkOrder,
      openModalViewRequisitions,
      setOpenModalViewRequisitions,
      dataRequisitions,
      listAccounts,
      fnGetDataDetail,
      openMsgDeleteDocument,
      setOpenMsgDeleteDocument,
      fnOkDeleteDocument
    }
  )
}
