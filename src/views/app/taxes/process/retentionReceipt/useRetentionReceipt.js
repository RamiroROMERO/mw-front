import TableButtons from '@/components/tableButtons';
import createNotification from '@/containers/ui/Notifications';
import { formatNumber, validInt } from '@/helpers/Utils'
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useRetentionReceipt = ({ setLoading, onResetFormDetail, retentionDetail, setRetentionDetail, setSendFormDeta, setBulkFormDetail }) => {
  const [sendForm, setSendForm] = useState(false);
  const [dataRetention, setDataRetention] = useState([]);
  const [openModalRetention, setOpenModalRetention] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [openModalBillToPay, setOpenModalBillToPay] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [listDocto, setListDocto] = useState([]);
  const [listProvider, setListProvider] = useState([]);
  const [listTypesRetention, setListTypesRetention] = useState([]);
  const [listCxp, setListCxp] = useState([]);

  const validRetention = {
    date: [(val) => val !== "", "msg.required.input.date"],
    documentCode: [(val) => val !== "", "msg.required.input.codeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
  }

  const { formState: formStateIndex, formValidation: formValidationIndex, isFormValid: isFormValidIndex, setBulkForm: setBulkFormIndex, onInputChange: onInputChangeIndex, onResetForm: onResetFormIndex } = useForm({
    id: 0,
    date: '',
    documentCode: '',
    documentId: '',
    cai: '',
    numberCAI: '',
    limitDate: '',
    providerId: '',
    rangeCAI: '',
    total: 0
  }, validRetention)

  const { id: code, date, documentCode: codeIndex, documentId, cai, numberCAI, limitDate,
    providerId, rangeCAI, total } = formStateIndex;

  const fnPrintRetention = () => {
    if (code > 0) {
      setOpenModalPrint(true);
    }
  }

  const fnNewRetention = () => {
    onResetFormDetail();
    onResetFormIndex();
    setRetentionDetail([]);
    setSendForm(false);
    setSendFormDeta(false);
  }

  const fnSearchRetention = () => {
    setLoading(true);
    request.GET('tax/process/withholdingReceipts', (resp) => {
      const receipts = resp.data.map((item) => {
        item.document = item.setDocument ? item.setDocument.name : ""
        item.provider = item.invProvider.name ? item.invProvider.name : ""
        item.value = formatNumber(item.total, '', 2);
        return item;
      });
      setDataRetention(receipts);
      setOpenModalRetention(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetDocuments = () => {
    setLoading(true);
    request.GET('admin/documents?status=1&useTax=1', (resp) => {
      const docto = resp.data.map((item) => {
        return {
          label: ` ${item.code} | ${item.name} `,
          value: item.code,
          documentId: item.codeInt,
          setTaxDocument: item.setTaxDocument
        }
      });
      setListDocto(docto);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveRetention = () => {
    setSendForm(true);
    if (!isFormValidIndex) {
      return;
    }
    if (retentionDetail.length === 0) {
      createNotification('warning', 'msg.required.select.retentionDocument', 'alert.warning.title');
      return;
    }
    const newData = {
      date,
      documentCode: codeIndex,
      documentId,
      cai,
      numberCAI,
      limitDate: limitDate === "" ? "1900-01-01" : limitDate,
      providerId,
      rangeCAI,
      total
    }
    retentionDetail.map((item) => {
      delete item.id;
      return item;
    });
    if (code && code > 0) {
      setLoading(true);
      request.PUT(`tax/process/withholdingReceipts/${code}`, newData, () => {
        setLoading(false);
        // Eliminar recibo
        request.DELETE(`tax/process/withholdingReceiptDetail?fatherId=${code}`, () => {
          // guardar recibo
          retentionDetail.forEach(item => {
            const productDeta = {
              fatherId: code,
              ...item
            }
            setLoading(true);
            request.POST('tax/process/withholdingReceiptDetail', productDeta, () => {
              setLoading(false);
            }, (err) => {
              console.error(err);
              setLoading(false);
            }, false);
          });
        }, (err) => {
          console.error(err);
          setLoading(false);
        }, false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      // Generar documento
      setLoading(true);
      request.POST('admin/documents/getCurrentNumber', { code: codeIndex }, (resp) => {
        newData.documentId = resp.data.codeInt;
        newData.cai = resp.data.cai;
        newData.numberCAI = resp.data.numCai;
        newData.limitDate = resp.data.limitDate;
        newData.rangeCAI = resp.data.noRange;
        setLoading(false);

        setLoading(true);
        request.POST('tax/process/withholdingReceipts', newData, (resp2) => {
          setBulkFormIndex({
            documentId: resp.data.codeInt,
            cai: resp.data.cai,
            numberCAI: resp.data.numCai,
            limitDate: resp.data.limitDate,
            rangeCAI: resp.data.noRange,
            id: resp2.data.id
          });

          fnGetDocuments();

          // guardar recibo
          retentionDetail.forEach(item => {
            const productDeta = {
              fatherId: resp2.data.id,
              ...item
            }
            setLoading(true);
            request.POST('tax/process/withholdingReceiptDetail', productDeta, (resp2) => {
              setLoading(false);
            }, (err) => {
              console.error(err);
              setLoading(false);
            }, false);
          });
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

      }, (err) => {
        console.error(err);
        setLoading(false);
      }, false);
    }
  }

  const fnDeleteRetention = () => {
    if (code > 0) {
      const filterPurchases = dataRetention.filter((item) => {
        return item.receipId === code
      });
      if (filterPurchases.length === 0) {
        setOpenMsgDelete(true);
      } else {
        createNotification('warning', 'msg.purchaseOrder.processed', 'alert.warning.title');
      }
    }
  }

  const fnOkDeleteRetention = () => {
    setLoading(true);
    request.DELETE(`tax/process/withholdingReceipts/${code}`, (resp) => {
      // eliminar detalle de la orden de compra
      setLoading(true);
      request.DELETE(`tax/process/withholdingReceiptDetail?fatherId=${code}`, (resp2) => {
        setOpenMsgDelete(false);
        fnNewRetention();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSelectCxp = (item) => {
    onResetFormDetail();
    const newCxp = {
      documentCode: item.documentCode,
      baseValue: item.value,
      description: "",
      percentValue: "",
      totalValue: ""
    }
    setBulkFormDetail(newCxp);
    setOpenModalBillToPay(false);
  }

  const fnViewCxp = () => {
    setLoading(true);
    setListCxp([]);
    request.GET(`accounting/process/cxp?providerId=${providerId}`, (resp) => {
      const acounts = resp.data.map((item) => {
        item.code = item.documentCode
        item.descrip = item.description
        item.provider = item.invProvider ? item.invProvider.name : ''
        item.total = formatNumber(item.value, '', 2)
        item.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectCxp(item)} />
        return item;
      });
      setListCxp(acounts);
      setOpenModalBillToPay(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`inventory/process/providers?status=1`, (resp) => {
      const providerValue = resp.data.map((item) => {
        return {
          value: item.id,
          label: ` ${item.dni} | ${item.name}`,
        }
      });
      setListProvider(providerValue);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET(`tax/settings/withholdingTypes?status=1`, (resp) => {
      const retention = resp.data.map((item) => {
        return {
          value: item.name,
          label: item.name,
          percentValue: item.value
        }
      });
      setListTypesRetention(retention);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetDocuments();
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewRetention,
    fnSearch: fnSearchRetention,
    fnSave: fnSaveRetention,
    fnPrint: fnPrintRetention,
    fnDelete: fnDeleteRetention,
    buttonsHome: [
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formStateIndex,
      formValidationIndex,
      onInputChangeIndex,
      setBulkFormIndex,
      sendForm,
      dataRetention,
      openModalRetention,
      setOpenModalRetention,
      openMsgDelete,
      setOpenMsgDelete,
      openModalBillToPay,
      setOpenModalBillToPay,
      openModalPrint,
      setOpenModalPrint,
      fnOkDeleteRetention,
      fnViewCxp,
      listProvider,
      listDocto,
      listTypesRetention,
      listCxp
    }
  )
}
