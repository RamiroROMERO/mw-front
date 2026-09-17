import { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request, buildUrl } from '@Helpers/core';
import { validInt, validFloat } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import createNotification from '@Containers/ui/Notifications';

export const useInventory = ({ inventoryDetail, setInventoryDetail, onResetFormDeta, setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [dataInventory, setDataInventory] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewInventoryAd, setOpenModalViewInventoryAd] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openMsgAddRemaining, setOpenMsgAddRemaining] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validInventory = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    applyTo: [(val) => val !== "", "msg.required.select.applyTo"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: DateHelper.format(new Date()),
    sourceStoreId: 0,
    applyTo: 'Inventario',
    userId: userData ? userData.id : 0,
    pdaNumber: 0,
    status: true
  }, validInventory);

  const { id, documentCode, documentId, date, sourceStoreId, applyTo, userId, pdaNumber, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = id > 0 && !status;
  const isSaved = validInt(id) > 0;
  const disabled = isProcessed || isVoided;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setInventoryDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactions', { typeName: 'Ajuste' }), (resp) => {
      const adjustments = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = ''
        item.noPhysical = ''
        return item;
      });
      setDataInventory(adjustments);
      setOpenModalViewInventoryAd(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: idReq }), (resp) => {
      const adjustDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      setInventoryDetail(adjustDeta);
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
      applyTo,
      userId,
      status
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
        // Eliminar detalle del ajuste
        request.DELETE(buildUrl('inventory/process/inventoryTransactionDetail', { idFather: id }), () => {
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
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Ajuste de Inventario.pdf', (err) => {

        setLoading(false);
      });
    }
  }

  // Eliminación física — solo antes de Aplicar Ajuste. Una vez aplicado, usar Anular.
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
      setInventoryDetail([]);

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

  // "Aplicar Ajuste" (btnGenAuxiliar del legacy) — es la ÚNICA acción real: calcula la
  // diferencia contra el saldo real de kardex y contabiliza. No existe un botón separado
  // de "Contabilizar" genérico (el legacy lo tenía pero solo tiene sentido llamado desde
  // acá, nunca de forma independiente).
  const fnAskProcess = () => {
    if (id === 0) return;
    setOpenMsgProcess(true);
  }

  const fnProcessAdjustment = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`inventory/process/inventoryTransactions/processAdjustment/${id}`, {}, (resp) => {
      onBulkForm({ pdaNumber: resp.data.numberPDA });
      createNotification('success', 'msg.success.processDocument', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode === 'adjustment.noChanges') {
        createNotification('warning', 'msg.warning.noChangesAdjustment', 'alert.warning.title');
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

  const fnVoidAdjustment = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`inventory/process/inventoryTransactions/voidAdjustment/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      onResetForm();
      onResetFormDeta();
      setInventoryDetail([]);
      createNotification('success', 'msg.success.voidDocument', 'alert.success.title');
      setLoading(false);
    }, () => {
      createNotification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  // "Agregar Rest." — agrega con cantidad 0 todos los productos del almacén que todavía no
  // están en el detalle, para poder hacer un conteo físico completo de la bodega.
  const fnAskAddRemaining = () => {
    if (disabled) return;
    if (validInt(sourceStoreId) === 0) {
      createNotification('warning', 'msg.required.select.warehouse', 'alert.warning.title');
      return;
    }
    setOpenMsgAddRemaining(true);
  }

  const fnAddRemaining = () => {
    setOpenMsgAddRemaining(false);
    setLoading(true);
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId: sourceStoreId }), (resp) => {
      const existingCodes = inventoryDetail.map((item) => item.productCode);
      const missing = resp.data
        .filter((item) => !existingCodes.includes(item.productCode))
        .map((item) => ({
          idTemp: new Date().getTime() + Math.random(),
          originStoreId: sourceStoreId,
          productCode: item.productCode,
          nameProduct: item.productName,
          cost: validFloat(item.costValue),
          qty: 0,
          total: 0,
          lotCode: '',
          dateOut: '1900-01-01'
        }));
      setInventoryDetail([...inventoryDetail, ...missing]);
      setLoading(false);
    }, () => { setLoading(false); });
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
        title: "button.applyAdjustment",
        icon: "bi bi-check-lg",
        onClick: isSaved && !isProcessed ? fnAskProcess : () => { }
      },
      {
        title: "button.addRemaining",
        icon: "bi bi-plus-circle",
        onClick: !disabled ? fnAskAddRemaining : () => { }
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
      fnOkDeleteDocument,
      disabled,
      isProcessed,
      isVoided,
      isSaved,
      openMsgProcess,
      setOpenMsgProcess,
      fnProcessAdjustment,
      openModalVoid,
      setOpenModalVoid,
      fnVoidAdjustment,
      openMsgAddRemaining,
      setOpenMsgAddRemaining,
      fnAddRemaining
    }
  )
}
