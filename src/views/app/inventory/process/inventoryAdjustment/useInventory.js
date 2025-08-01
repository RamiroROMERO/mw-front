import { useEffect, useState } from 'react'
import { useForm } from '@/hooks'
import { request } from '@/helpers/core';
import { validInt } from '@/helpers/Utils';
import moment from 'moment';
import createNotification from '@/containers/ui/Notifications';

export const useInventory = ({ inventoryDetail, setInventoryDetail, onResetFormDeta, setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listTypeApply, setListTypeApply] = useState([]);
  const [dataInventory, setDataInventory] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewInventoryAd, setOpenModalViewInventoryAd] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validInventory = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    applyId: [(val) => val !== "", "msg.required.select.applyTo"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: moment(new Date()).format("YYYY-MM-DD"),
    sourceStoreId: 0,
    applyId: 0,
    userId: userData ? userData.id : 0
  }, validInventory);

  const { id, documentCode, documentId, date, sourceStoreId, applyId, userId } = formState;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setInventoryDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(`inventory/process/inventoryTransactions?typeName=Ajuste`, (resp) => {
      const refunds = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : ''
        item.noPhysical = item.code
        return item;
      });
      setDataInventory(refunds);
      setOpenModalViewInventoryAd(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(`inventory/process/inventoryTransactionDetail?idFather=${idReq}`, (resp) => {
      const adjustDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      setInventoryDetail(adjustDeta);
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

    if (inventoryDetail.length === 0) {
      createNotification('warning', 'msg.required.documentDetail', 'alert.warning.title');
      return;
    }

    const typeName = "Ajuste";

    const newData = {
      documentCode,
      documentId,
      date,
      sourceStoreId,
      typeName,
      applyId,
      userId
    }

    inventoryDetail.map((item) => {
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

        // Guardar ajuste
        setLoading(true);
        request.POST('inventory/process/inventoryTransactions', newData, (resp2) => {
          onBulkForm({ documentId: resp.data.codeInt, id: resp2.data.id });
          setSendForm(false);

          // guardar detalle del ajuste
          inventoryDetail.forEach(item => {
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
        // Eliminar detalle del ajuste
        request.DELETE(`inventory/process/inventoryTransactionDetail?idFather=${id}`, () => {
          // guardar detalle del ajuste
          inventoryDetail.forEach(item => {
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
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Inventario Físico.pdf', (err) => {
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
      setInventoryDetail([]);

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

  const fnApplyAdjustment = () => { }

  const fnAddRemaining = () => { }

  const fnPrintAdjustment = () => { }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          idCtaInventory: item.idCtaInventory
        }
      });
      setListStores(stores);
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
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      {
        title: "button.applyAdjustment",
        icon: "bi bi-check-lg",
        onClick: fnApplyAdjustment
      },
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnCount
      },
      {
        title: "button.addRemaining",
        icon: "bi bi-plus-circle",
        onClick: fnAddRemaining
      },
      {
        title: "button.printAdjustment",
        icon: "bi bi-printer",
        onClick: fnPrintAdjustment
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
      listTypeApply,
      sendForm,
      setSendForm,
      sendFormDeta,
      setSendFormDeta,
      isFormValid,
      formValidation,
      dataInventory,
      openModalViewInventoryAd,
      setOpenModalViewInventoryAd,
      onBulkForm,
      fnGetDataDetail,
      openMsgDeleteDocument,
      setOpenMsgDeleteDocument,
      fnOkDeleteDocument
    }
  )
}
