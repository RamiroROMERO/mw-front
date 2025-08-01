import createNotification from '@/containers/ui/Notifications';
import { formatNumber, validInt } from '@/helpers/Utils'
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useCheckRequest = ({ setLoading, onResetFormDetail }) => {
  const [listBeneficiary, setListBeneficiary] = useState([]);
  const listAccountType = [{ id: 1, name: "Cuenta de Ahorro" }, { id: 2, name: "Cuenta de Cheques" }, { id: 3, name: "Cuenta ade Ahorro en Dolares" }, { id: 4, name: " Cuenta de Ahorro en Lempiras" }]
  const [listRequest, setListRequest] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validRequest = {
    date: [(val) => val != '', "msg.required.input.date"],
    valueCurrency: [(val) => validInt(val) > 0, "msg.required.input.valueCurrency"],
    typeRequest: [(val) => validInt(val) > 0, "msg.required.radio.typeRequest"],
    beneficiaryId: [(val) => validInt(val) > 0, "msg.required.select.beneficiary"],
    conceptPayment: [(val) => val != '', "msg.requiered.input.conceptpayment"],
    requestorId: [(val) => val != '', "msg.requiered.input.requestorId"],
  }

  const [openModalViewRequest, setOpenModalViewRequest] = useState(false);
  const [openModalCheckPayroll, setOpenModalCheckPayroll] = useState(false);
  const { formState: formStateIndex, setBulkForm: setBulkFormIndex, onResetForm: onResetFormIndex, onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex, } = useForm({
    id: 0,
    date: '',
    valueCurrency: 0,
    typeRequest: 0,
    letterValue: '',
    beneficiaryId: 0,
    conceptPayment: '',
    accountType: '',
    nameBank: '',
    numberAccount: '',
    nameBeneficiary: '',
    rtn: '',
    email: '',
    requestorId: '',
    state: '',
    numberId: 0,
    dateState: ''
  }, validRequest)

  const { id, date, valueCurrency, typeRequest, letterValue, beneficiaryId, conceptPayment, accountType, nameBank, numberAccount, nameBeneficiary, rtn, email, requestorId, state, numberId, dateState } = formStateIndex;

  const fnNewCheckRequest = () => {
    onResetFormIndex();
    onResetFormDetail();
    setSendForm(false);
  }

  const fnSearchRequest = () => {
    setOpenModalViewRequest(true)
  }

  const fnSaveCheckRequest = () => {
    setSendForm(true)
    if (!isFormValidIndex) {
      return;
    }
  }

  const fnPrintcheckRequest = () => { }
  const fnDeleteCheckRequest = () => { }
  const fnGenerateBatches = () => {
    setOpenModalCheckPayroll(true);
  }

  const propsToControlPanel = {
    fnNew: fnNewCheckRequest,
    fnSearch: fnSearchRequest,
    fnSave: fnSaveCheckRequest,
    fnPrint: fnPrintcheckRequest,
    fnDelete: fnDeleteCheckRequest,
    buttonsHome: [
      {
        title: "button.lots",
        icon: "bi bi-list-check",
        onClick: fnGenerateBatches
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formStateIndex,
      setBulkFormIndex,
      onInputChangeIndex,
      onResetFormIndex,
      listBeneficiary,
      listAccountType,
      openModalViewRequest,
      setOpenModalViewRequest,
      listRequest,
      setListRequest,
      fnSearchRequest,
      formValidationIndex,
      sendForm,
      openModalCheckPayroll,
      setOpenModalCheckPayroll
    }
  )
}
