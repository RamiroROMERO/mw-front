import React, { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import createNotification from '@/containers/ui/Notifications';

export const useCompanyInf = ({setLoading}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [checkActive, setCheckActive] = useState(true);
  const [sendForm, setSendForm] = useState(false);
  const [openInternalOptionsModal, setOpenInternalOptionsModal] = useState(false);
  const [openMailOptionsModal, setOpenMailOptionsModal] = useState(false);
  const [tableData, setTableData] = useState([]);

  const companyValid = {
    dni: [(val) => val.length > 12 && val.length <= 16, "msg.required.input.rtn"],
    name: [(val) => val.length > 5, "msg.required.input.name"],
    address1: [(val) => val.length > 5, "msg.required.input.address1"],
    phone: [(val) => val !== "", "msg.required.input.phone"],
    email: [(val) => val !== "", "msg.required.input.mail"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    dni: '',
    name: '',
    name2: '',
    address1: '',
    address2: '',
    address3: '',
    phone: '',
    email: '',
    webSite: '',
    accountantName: '',
    managerName: '',
    seatAccForSales: false,
    seatAccForSalesCost: false,
    seatAccForPurchase: false,
    seatAccForInventory: false,
    seatAccForBanks: false,
    seatAccForDebitNotes: false,
    seatAccForCreditNotes: false,
    hasStoreControl: false,
    hasStockControl: false,
    hasDateOutControl: false,
    hasProductOneManyControl: false,
    hasSellerControl: false,
    hasDualCurrency: false,
    isDefault: false,
    lastCloseDate: '',
    status: true
  }, companyValid);

  const {id} = formState;

  const checkChange = (item) => {
    onInputChange(item);
    if (formState.hasStoreControl > 0) {
      setCheckActive(true);
    } else {
      setCheckActive(false);
    }
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/companies', (resp) => {
      const data = resp.data;
      setTableData(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    formState.lastCloseDate = formState.lastCloseDate === '' ? "1900-01-01" : formState.lastCloseDate

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/companies/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/companies', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/companies/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const onViewInternalOptions = () => {
    if (validInt(id) === 0) {
      createNotification('warning', "msg.required.select.companyId", 'alert.warning.title');
      return;
    }
    setOpenInternalOptionsModal(true);
  };

  const onViewMailOptions = () => {
    if (validInt(id) === 0) {
      createNotification('warning', "msg.required.select.companyId", 'alert.warning.title');
      return;
    }
    setOpenMailOptionsModal(true);
  };

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

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
    checkActive,
    onViewInternalOptions,
    onViewMailOptions,
    checkChange,
    onInputChange,
    fnSave,
    fnClearInputs
  };

  return (
    {
      companyId: id,
      propsToDetail,
      propsToDetailTable,
      propsToMsgDelete,
      openInternalOptionsModal,
      openMailOptionsModal,
      setOpenInternalOptionsModal,
      setOpenMailOptionsModal
    }
  )
}
