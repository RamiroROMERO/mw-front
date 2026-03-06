import { useState } from 'react'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { useForm } from '@/hooks';
import { API_URLS } from '@/helpers/APIUrl';
import { validFloat, validInt } from '@/helpers/Utils';
import ViewPdf from '@/components/ViewPDF/ViewPdf';
import ModalGeneratePayment from './ModalGeneratePayment';

export const useHeader = ({ setLoading, enableGenerateReport, listEmployees, setDataBenefits, otherPayments, totalBenefits }) => {
  const [sendForm, setSendForm] = useState(false);
  const [openModalPaymentPlan, setOpenModalPaymentPlan] = useState(false);

  // imprimir pdf
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const deductionsValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    monthlySalary: [(val) => validFloat(val) > 0, "msg.required.input.salary"],
    dateIn: [(val) => val !== "", "msg.required.input.dateIn"],
    dateOut: [(val) => val !== "", "msg.required.input.dateOut"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    employeeId: 0,
    monthlySalary: '',
    dateIn: '',
    dateOut: '',
    typeId: 0
  }, deductionsValid);

  const {employeeId, monthlySalary, dateIn, dateOut, typeId} = formState;

  const onEmployeeId = e => {
    const emplId = e.target.value;

    const findEmployee = listEmployees.find(item => item.id === emplId);

    onBulkForm({
      employeeId: emplId,
      monthlySalary: findEmployee.defaultSalary,
      dateIn: findEmployee.dateIn
    });
  }

  const fnGetData = () => {
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }

    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    let url = `${API_URLS.RRHH_PROC_CALCULATION_BENEFITS}`;

    const data = {
      employeeId,
      monthlySalary,
      dateIn,
      dateOut,
      typeId
    }

    setLoading(true);
    request.POST(url, data, (resp) => {
      const data = resp.data;
      setDataBenefits(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    }, false);
  }

  const fnPrintPdf = () => {
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }

    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const dataPrint = {
      employeeId,
      monthlySalary,
      dateIn,
      dateOut,
      typeId,
      otherPayments
    }

    request.GETPdfUrl(`${API_URLS.RRHH_PROC_CALCULATION_BENEFITS}/exportPDF`, dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGeneratePaymentPlan = () => {
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }

    if(validFloat(totalBenefits) === 0){
      return;
    }

    setOpenModalPaymentPlan(true);

  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.calulateBenefits",
    // valueTitle: quoteId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  const propsToModalGeneratePayments = {
    ModalContent: ModalGeneratePayment,
    title: "page.calculationBenefits.modal.generatePayments.title",
    open: openModalPaymentPlan,
    setOpen: setOpenModalPaymentPlan,
    maxWidth: 'lg',
    data: {
      employeeId,
      totalBenefits,
      setLoading
    }
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      onEmployeeId,
      onInputChange,
      fnGetData,
      fnPrintPdf,
      fnGeneratePaymentPlan,
      propsToViewPDF,
      propsToModalGeneratePayments
    }
  )
}
