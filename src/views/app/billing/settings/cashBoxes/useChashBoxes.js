import React, { useEffect, useState, } from "react";
import { request } from "@/helpers/core";
import { useForm } from "@Hooks/useForms";

const useChashBoxes = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [listBillingArea, setListBillingArea] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const cashBoxValid = {
    name: [(val)=>val.length>5, "msg.required.input.name"],
    idCtaCash: [(val)=>val!=="", "msg.required.input.cashAccount"],
    idCtaDeposit: [(val)=>val!=="", "msg.required.input.depositAccount"],
    billingAreaId: [(val)=>val!=="", "msg.required.select.areaId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    idCtaCash: '',
    idCtaDeposit: '',
    billingAreaId: '',
    status: true
  }, cashBoxValid);

  const fnClearInputs = ()=>{
    setSendForm(false);
    onResetForm();
  }

  const fnEditItem = (item) => {
    onBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('billing/settings/cashRegisters', (resp) => {
      const { data } = resp;
      setTableData(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const data = { ...formState };
    if (data && data.id > 0) {
      setLoading(true);
      request.PUT(`billing/settings/cashRegisters/${data.id}`, data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('billing/settings/cashRegisters', data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {

    fnGetData();
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccount = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListLedgerAccount(listAccount);
      setLoading(false);
      fnGetData();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/areas?status=1&useBilling=1', (resp) => {
      const area = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListBillingArea(area);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

  }, []);

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const data = {
      status: 0
    }
    if (selectedItem.id && selectedItem.id > 0) {
      setLoading(true);
      request.PUT(`billing/settings/cashRegisters/${selectedItem.id}`, data, (resp) => {
        fnGetData();
        setSelectedItem({})
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const propsToDetailTable = {
    tableData,
    fnEditItem,
    fnDeleteItem
  }

  const propsToDetail = {
    formState,
    formValidation,
    sendForm,
    listBillingArea,
    listLedgerAccount,
    onInputChange,
    fnSave,
    fnClearInputs
  };

  return {
    propsToMsgDelete: {
      open: openMsgQuestion,
      setOpen: setOpenMsgQuestion,
      fnOnOk: fnDisableDocument,
      title: "alert.question.title"
    },
    propsToDetail,
    propsToDetailTable
  }
};

export default useChashBoxes;