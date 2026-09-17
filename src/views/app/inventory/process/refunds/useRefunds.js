import DateHelper from '@Helpers/DateHelper';
import { useEffect, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks'
import { validInt } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

export const useRefunds = ({ refundDetail, onResetFormDeta, setRefundDetail, setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listTypeApply, setListTypeApply] = useState([]);
  const [dataRefunds, setDataRefunds] = useState([]);
  const [showType1, setShowType1] = useState("block");
  const [showType2, setShowType2] = useState("none");
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewRefunds, setOpenModalViewRefunds] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validRefunds = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: DateHelper.format(new Date()),
    code: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    notes: '',
    userId: userData ? userData.id : 0,
    pdaNumber: 0,
    noCtaOrigin: '',
    noCtaAssign: '',
    applyTo: '',
    providerId: 0,
    reintType: 1,
    expirationDate: '',
    status: true
  }, validRefunds);

  const { id, documentCode, documentId, date, code, sourceStoreId, assignStoreId, notes, userId, applyTo, providerId, reintType, expirationDate, pdaNumber, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = id > 0 && !status;
  const isSaved = validInt(id) > 0;
  const disabled = isProcessed || isVoided;
  const isPurchaseType = validInt(reintType) === 1;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setRefundDetail([]);
    setShowType1("block");
    setShowType2("none");
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactions', { typeName: 'Reint' }), (resp) => {
      const refunds = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : (item.providerData ? item.providerData.name : '')
        item.noPhysical = item.code
        return item;
      });
      setDataRefunds(refunds);
      setOpenModalViewRefunds(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq, type = 2) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: idReq }), (resp) => {
      const refundDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      if (validInt(type) === 1) {
        setShowType1("block");
        setShowType2("none");
      } else {
        setShowType1("none");
        setShowType2("block");
      }
      setRefundDetail(refundDeta);
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

    if (refundDetail.length === 0) {
      createNotification('warning', 'msg.required.documentDetail', 'alert.warning.title');
      return;
    }

    const typeName = "Reint";

    const newData = {
      documentCode,
      documentId,
      date,
      code,
      sourceStoreId,
      assignStoreId,
      typeName,
      notes,
      userId,
      applyTo,
      providerId,
      reintType,
      expirationDate: expirationDate === "" ? '1900-01-01' : expirationDate,
      status
    }

    refundDetail.map((item) => {
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

        // Guardar reintegro
        setLoading(true);
        request.POST('inventory/process/inventoryTransactions', newData, (resp2) => {
          onBulkForm({ documentId: resp.data.codeInt, id: resp2.data.id });
          setSendForm(false);

          // guardar detalle del reintegro
          refundDetail.forEach(item => {
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
        // Eliminar detalle del reintegro
        request.DELETE(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: id }), () => {
          // guardar detalle del reintegro
          refundDetail.forEach(item => {
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
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Ingresos y Reintegros.pdf', (err) => {

        setLoading(false);
      });
    }
  }

  // Eliminación física — solo antes de Aplic. Inv. (fiel al legacy). Una vez aplicado,
  // usar Anular (fnAskVoid) en su lugar.
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
      setRefundDetail([]);
      setShowType1("block");
      setShowType2("none");

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

  // "Aplic. Inv." (btnContabDocument del legacy) es la única acción real de contabilizar
  // en esta pantalla — btnGenAuxiliar existe en el legacy pero está deshabilitado
  // (Enabled=.F.), nunca fue un botón funcional.
  const fnAskProcess = () => {
    if (id === 0) return;
    if (isPurchaseType && validInt(providerId) === 0) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setOpenMsgProcess(true);
  }

  const fnProcessRefund = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`inventory/process/inventoryTransactions/processRefund/${id}`, {}, (resp) => {
      onBulkForm({ pdaNumber: resp.data.numberPDA });
      createNotification('success', 'msg.success.processDocument', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      createNotification('error', 'msg.error.processDocument', 'alert.error.title');
      setLoading(false);
    });
  }

  const fnAskVoid = () => {
    if (id === 0 || !isProcessed) return;
    setOpenModalVoid(true);
  }

  const fnVoidRefund = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`inventory/process/inventoryTransactions/voidRefund/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      onResetForm();
      onResetFormDeta();
      setRefundDetail([]);
      setShowType1("block");
      setShowType2("none");
      createNotification('success', 'msg.success.voidDocument', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode === 'refund.cxp.has.payments') {
        createNotification('error', 'msg.error.refund.cxpHasPayments', 'alert.error.title');
      } else {
        createNotification('error', 'msg.delete.record.error', 'alert.error.title');
      }
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
    request.GET('inventory/settings/stores', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          type: item.type,
          idCtaInventory: item.idCtaInventory,
          idCtaCost: item.idCtaCost,
          idCtaExpense: item.idCtaExpense
        }
      });
      const filter1 = stores.filter(item => { return item.type === 1 });
      const filter2 = stores.filter(item => { return item.type === 2 });

      setListStores(filter1);
      setListDestinations(filter2);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          idCtaCxp: item.idCtaCxp
        }
      });
      setListProviders(providers);
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
      listDestinations,
      listAccounts,
      listProviders,
      listTypeApply,
      showType1,
      showType2,
      setShowType1,
      setShowType2,
      onBulkForm,
      sendFormDeta,
      setSendFormDeta,
      sendForm,
      setSendForm,
      isFormValid,
      formValidation,
      openModalViewRefunds,
      setOpenModalViewRefunds,
      dataRefunds,
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
      fnProcessRefund,
      openModalVoid,
      setOpenModalVoid,
      fnVoidRefund
    }
  )
}
