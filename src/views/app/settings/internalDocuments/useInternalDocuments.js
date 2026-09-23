import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import notification from '@Containers/ui/Notifications';

export const useInternalDocuments = ({ setLoading }) => {
  const [listComp, setListComp] = useState([]);
  const [listTaxDoc, setListTaxDoc] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const itemsCodesValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"],
    title: [(val) => val !== "", "msg.required.input.title"],
    companyId: [(val) => validInt(val) > 0, "msg.required.input.company"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    code: '',
    name: '',
    type: 0,
    title: '',
    codeInt: '',
    useTaxDocument: false,
    companyId: 0,
    taxDocumentId: 0,
    isReportBank: false,
    useBill: 0,
    useAcc: 0,
    useFixass: 0,
    useInv: 0,
    useTax: 0,
    useBank: 0,
    bankCheck: false,
    bankTransfer: false,
    bankDepo: false,
    bankNcd: false,
    bankExpense: false,
    colorInReportBank: 0,
    status: true,
    notes1: '',
    notes2: '',
  }, itemsCodesValid);

  const { id, useBill, useAcc, useFixass, useInv, useTax, useBank, useTaxDocument, taxDocumentId, isReportBank, colorInReportBank,
    bankCheck, bankTransfer, bankDepo, bankNcd, bankExpense } = formState;

  // Igual que el legacy: RGB() empaqueta el color como un entero r + g*256 + b*65536
  // (la columna `color` en fac_doctos es INTEGER, no un string hex).
  const rgbIntToHex = (value) => {
    const num = validInt(value);
    const r = num % 256;
    const g = Math.floor(num / 256) % 256;
    const b = Math.floor(num / 65536) % 256;
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  }

  const hexToRgbInt = (hex) => {
    const r = Number.parseInt(hex.slice(1, 3), 16) || 0;
    const g = Number.parseInt(hex.slice(3, 5), 16) || 0;
    const b = Number.parseInt(hex.slice(5, 7), 16) || 0;
    return r + g * 256 + b * 65536;
  }

  const onColorChange = (e) => {
    onInputChange({ target: { name: 'colorInReportBank', value: hexToRgbInt(e.target.value) } });
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/documents', (resp) => {
      const data = resp.data;
      setTableData(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/documents/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if ((useBill === 0 || useBill === false) && (useInv === 0 || useInv === false) && (useAcc === 0 || useAcc === false)
      && (useTax === 0 || useTax === false) && (useFixass === 0 || useFixass === false) && (useBank === 0 || useBank === false)) {
      notification('warning', 'msg.required.check.useArea', 'alert.warning.title');
      return;
    }

    if (useTaxDocument && validInt(taxDocumentId) === 0) {
      notification('warning', 'msg.required.select.taxDocumentId', 'alert.warning.title');
      return;
    }

    if (useBank && !bankCheck && !bankTransfer && !bankDepo && !bankNcd && !bankExpense) {
      notification('warning', 'msg.required.check.bankArea', 'alert.warning.title');
      return;
    }

    if (isReportBank && validInt(colorInReportBank) === 0) {
      notification('warning', 'msg.required.input.colorInReportBank', 'alert.warning.title');
      return;
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/documents/${id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/documents', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/companies', (resp) => {
      const companies = resp.data;
      setListComp(companies)
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/taxDocuments', (resp) => {
      const setTaxDoc = resp.data;
      setListTaxDoc(setTaxDoc)
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    fnGetData();
  }, [])

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    title: "alert.question.title",
    onResetForm
  }

  const propsToDetailTable = {
    tableData,
    onBulkForm,
    setOpenMsgQuestion
  }

  const propsToDetail = {
    formState,
    formValidation,
    isFormValid,
    sendForm,
    listComp,
    listTaxDoc,
    onInputChange,
    onColorChange,
    colorHex: rgbIntToHex(colorInReportBank),
    fnSave,
    fnClearInputs
  };

  return (
    {
      propsToDetail,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
