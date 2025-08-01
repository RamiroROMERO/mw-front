import moment from 'moment';
import { useEffect, useState } from 'react';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { validInt } from '@/helpers/Utils';
import createNotification from '@/containers/ui/Notifications';

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
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validRefunds = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: moment(new Date()).format("YYYY-MM-DD"),
    code: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    notes: '',
    userId: userData ? userData.id : 0,
    applicated: 0,
    pdaNumber: '',
    noCtaOrigin: '',
    noCtaAssign: '',
    applyId: 0,
    providerId: 0,
    reintType: 1,
    expirationDate: ''
  }, validRefunds);

  const { id, documentCode, documentId, date, code, sourceStoreId, assignStoreId, notes, userId, applicated, applyId, providerId, reintType, expirationDate } = formState;

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
    request.GET(`inventory/process/inventoryTransactions?typeName=Reint`, (resp) => {
      const refunds = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : (item.invProvider ? item.invProvider.name : '')
        item.noPhysical = item.code
        return item;
      });
      setDataRefunds(refunds);
      setOpenModalViewRefunds(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetDataDetail = (idReq, type = 2) => {
    setLoading(true);
    request.GET(`inventory/process/inventoryTransactionDetail?idFather=${idReq}`, (resp) => {
      const refundDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      if (validInt(type) === 2) {
        setShowType1("none");
        setShowType2("block");
      } else {
        setShowType1("block");
        setShowType2("none");
      }
      setRefundDetail(refundDeta);
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
      applicated,
      applyId,
      providerId,
      reintType,
      expirationDate: expirationDate === "" ? '1900-01-01' : expirationDate
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
        // Eliminar detalle del reintegro
        request.DELETE(`inventory/process/inventoryTransactionDetail?idFather=${id}`, () => {
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
      request.GETPdf('inventory/process/inventoryTransactions/exportPDFRequisition', dataPrint, 'Ingresos y Reintegros.pdf', (err) => {
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
      setRefundDetail([]);

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
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
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
  }, []);

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
      fnOkDeleteDocument
    }
  )
}
