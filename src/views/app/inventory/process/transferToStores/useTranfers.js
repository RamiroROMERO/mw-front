import DateHelper from '@Helpers/DateHelper';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useEffect, useState } from 'react';
import { validInt } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

export const useTranfers = ({ setLoading, transferDetail, setTransferDetail, onResetFormDeta }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataTransfers, setDataTransfers] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewTransfers, setOpenModalViewTransfers] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validTransfers = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    assignStoreId: [(val) => validInt(val) > 0, "msg.required.select.destinationId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    documentCode: '',
    date: DateHelper.format(new Date()),
    code: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    notes: '',
    userId: userData ? userData.id : 0,
    applyTo: 'Inventario',
    pdaNumber: 0,
    noCtaOrigin: '',
    noCtaAssign: '',
    status: true
  }, validTransfers);

  const { id, documentId, documentCode, date, code, sourceStoreId, assignStoreId, notes, userId, applyTo, pdaNumber, noCtaAssign, noCtaOrigin, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = id > 0 && !status;
  const isSaved = validInt(id) > 0;
  const disabled = isProcessed || isVoided;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setTransferDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactions', { typeName: 'Trasl' }), (resp) => {
      const transactions = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : ''
        item.noPhysical = item.code
        return item;
      });
      setDataTransfers(transactions);
      setOpenModalViewTransfers(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: idReq }), (resp) => {
      const requisitionDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      setTransferDetail(requisitionDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (transferDetail.length === 0) {
      createNotification('warning', 'msg.required.documentDetail', 'alert.warning.title');
      return;
    }

    const typeName = "Trasl";

    const newData = {
      documentCode,
      documentId,
      date,
      code,
      sourceStoreId,
      assignStoreId,
      typeName,
      applyTo,
      notes,
      userId,
      status
    }

    transferDetail.map((item) => {
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

        // Guardar la transferencia
        setLoading(true);
        request.POST('inventory/process/inventoryTransactions', newData, (resp2) => {
          onBulkForm({ documentId: resp.data.codeInt, id: resp2.data.id });
          setSendForm(false);

          // guardar detalle de la transferencia
          transferDetail.forEach(item => {
            const detailReq = {
              idFather: resp2.data.id,
              ...item,
              dateOut: item.dateOut === "" ? "1900-01-01" : item.dateOut
            }
            setLoading(true);
            request.POST('inventory/process/inventoryTransactionDetail', detailReq, () => {
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
      }, (err) => {

        setLoading(false);
      }, false);
    } else {
      setLoading(true);
      request.PUT(`inventory/process/inventoryTransactions/${id}`, newData, () => {
        setLoading(false);
        setSendForm(false);
        // Eliminar detalle de la transferencia
        request.DELETE(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: id }), () => {
          // guardar detalle de la transferencia
          transferDetail.forEach(item => {
            const detailReq = {
              idFather: id,
              ...item,
              dateOut: item.dateOut === "" ? "1900-01-01" : item.dateOut
            }
            setLoading(true);
            request.POST('inventory/process/inventoryTransactionDetail', detailReq, () => {
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        }, false);
      }, (err) => {

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
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Traslado entre Almacenes.pdf', (err) => {

        setLoading(false);
      });
    }
  }

  // Eliminación física — solo antes de Contabilizar (fiel al legacy, que no permite tocar
  // el documento una vez aplicado). Una vez aplicado, usar Anular (fnAskVoid) en su lugar.
  const fnDeleteDocument = () => {
    if (id > 0 && !disabled) {
      setOpenMsgDeleteDocument(true);
    }
  }

  const fnOkDeleteDocument = () => {
    setOpenMsgDeleteDocument(false);
    setLoading(true);
    request.DELETE(`inventory/process/inventoryTransactions/${id}`, () => {
      onResetForm();
      onResetFormDeta();
      setTransferDetail([]);

      // eliminar detalle
      request.DELETE(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: id }), () => {
        setLoading(false);
      }, (err) => {

        setLoading(false);
      }, false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnAskProcess = () => {
    if (id === 0) return;
    setOpenMsgProcess(true);
  }

  const fnProcessTransfer = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`inventory/process/inventoryTransactions/process/${id}`, {}, (resp) => {
      onBulkForm({ pdaNumber: resp.data.numberPDA });
      createNotification('success', 'msg.success.processDocument', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode) {
        createNotification('error', `msg.error.transfer.${errorCode}`, 'alert.error.title');
      } else {
        createNotification('error', 'msg.error.processDocument', 'alert.error.title');
      }
      setLoading(false);
    });
  }

  const fnAskVoid = () => {
    if (id === 0 || !isProcessed) return;
    setOpenModalVoid(true);
  }

  const fnVoidTransfer = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`inventory/process/inventoryTransactions/void/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      onResetForm();
      onResetFormDeta();
      setTransferDetail([]);
      createNotification('success', 'msg.success.voidDocument', 'alert.success.title');
      setLoading(false);
    }, () => {
      createNotification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

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

      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          idCtaInventory: item.idCtaInventory,
          idCtaCost: item.idCtaCost,
          idCtaExpense: item.idCtaExpense
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: !disabled ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    fnDelete: !disabled ? fnDeleteDocument : null,
    fnCancel: isProcessed && !isVoided ? fnAskVoid : null,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: isSaved && !isProcessed ? fnAskProcess : () => { }
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
      sendFormDeta,
      setSendFormDeta,
      formValidation,
      sendForm,
      setSendForm,
      isFormValid,
      dataTransfers,
      openModalViewTransfers,
      setOpenModalViewTransfers,
      onBulkForm,
      listAccounts,
      fnGetDataDetail,
      openMsgDeleteDocument,
      setOpenMsgDeleteDocument,
      fnOkDeleteDocument,
      disabled,
      isProcessed,
      isVoided,
      isSaved,
      openMsgProcess,
      setOpenMsgProcess,
      fnProcessTransfer,
      openModalVoid,
      setOpenModalVoid,
      fnVoidTransfer
    }
  )
}
