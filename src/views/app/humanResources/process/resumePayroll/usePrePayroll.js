import { request } from '@/helpers/core';
import { formatDate, formatNumber, IntlMessages, validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useState } from 'react'
import ModalViewDetailPay from './ModalViewDetailPay';

export const usePrePayroll = ({listProjects, listTypeDeductions, listEmployees, listJobPositions, listPaymentMethod, listSchedules,listTypeIncomes, setLoading, userData, fnViewDetailPayroll, onBulkForm, setOpen, setListProjectsFilter}) => {
  const [sendForm, setSendForm] = useState(false);
  const [dataTotals, setDataTotals] = useState({});
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [currentItemDeta, setCurrentItemDeta] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const formValidations = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    dateStart: [(val) => val !== "", "msg.required.input.dateIn"],
    dateEnd: [(val) => val !== "", "msg.required.input.dateOut"]
  }

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, onBulkForm: onBulkFormDeta } = useForm({
    customerId: 0,
    projectId: 0,
    date: "",
    dateStart: "",
    dateEnd: "",
    isConfidential: 0,
    notes: ""
  }, formValidations);

  const {customerId, projectId, date, dateStart, dateEnd, isConfidential, notes} = formStateDeta;

  const fnEditPayroll = (item) => {
    setCurrentItemDeta(item);
    setOpenModalDetail(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "5%" }
      },
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("page.resumePayroll.table.jobPosition"),
        dataField: "jobPosition",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.employees.select.workSchedule"),
        dataField: "turnName",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalIncome"),
        dataField: "totalIncomesValue",
        headerStyle: {width: "12%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalDeductions"),
        dataField: "totalDeductionsValue",
        headerStyle: {width: "12%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalPayment"),
        dataField: "totalPaymentValue",
        headerStyle: {width: "12%"},
        style:{textAlign: 'right'}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "eye",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditPayroll,
      }
    ]
  });

  const onCustomerChange = e =>{
    const custId = validInt(e.target.value);

    const filter = listProjects.filter((item)=>{
      return item.customerId === custId
    });

    setListProjectsFilter(filter);

    onBulkFormDeta({customerId: custId, projectId:0});
  }

  const fnViewPrePayroll = () => {
    setSendForm(true);
    if (!isFormValidDeta) {
      return;
    }
    setLoading(true);
    //obtener los valores antes de guardar la planilla
    request.GET(`rrhh/process/weeklyPayrolls/getPrePayroll?customerId=${customerId}&projectId=${projectId}&dateStart=${dateStart}&dateEnd=${dateEnd}`, (resp) => {
      const {detailPayroll, totals} = resp.data;
      const payrollDeta = detailPayroll.map((item, idx) => {
        item.num = idx + 1
        item.jobPosition = item.rrhhJobPosition?.name || ''
        item.totalIncomesValue = formatNumber(validFloat(item.totalIncomes))
        item.totalDeductionsValue = formatNumber(validFloat(item.totalDeductions))
        item.totalPaymentValue = formatNumber(validFloat(item.totalPayment))
        item.turnName = item.rrhhSchedule?.name || ''
        item.dateIn = formatDate(item.dateIn)
        return item
      });
      setTable({...table, data: payrollDeta});
      setDataTotals(totals);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGeneratePayroll = () => {
    setSendForm(true);
    if (!isFormValidDeta) {
      return;
    }
    setOpenMsgQuestion(true);
  }

  const fnConfirmGeneratePayroll = () => {
    setOpenMsgQuestion(false);

    const newData = {
      typeId: 1,
      date,
      customerId,
      projectId,
      dateStart,
      dateEnd,
      notes,
      status: 1,
      isConfidential,
      userId: userData.id
    }

    setLoading(true);
    request.POST('rrhh/process/weeklyPayrolls/generatePayroll', newData, (resp) => {
      if (validInt(resp.data.id) > 0) {
        onBulkForm(resp.data);
      }
      const filter = listProjects.filter((item)=>{
        return item.customerId === resp.data.customerId
      });

      setListProjectsFilter(filter);
      fnViewDetailPayroll(resp.data.id);
      setSendForm(false);
      setOpen(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const propsToModalDetailPay = {
    ModalContent: ModalViewDetailPay,
    title: "page.resumePayroll.modal.viewDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      idPayroll: 0,
      typePayroll: 1,
      dateStart,
      dateEnd,
      notes: '',
      listTypeDeductions,
      listEmployees,
      listJobPositions,
      listPaymentMethod,
      listSchedules,
      listTypeIncomes,
      currentItemDeta,
      setLoading,
      fnViewDetailPayroll: () => {}
    }
  }

  const propsToMsgGeneratePayroll = {
    title: "alert.question.generatePayroll",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmGeneratePayroll,
    fnOnNo: () => {}
  };

  return (
    {
      formStateDeta,
      formValidationDeta,
      sendForm,
      table,
      dataTotals,
      onInputChangeDeta,
      onCustomerChange,
      fnViewPrePayroll,
      fnGeneratePayroll,
      propsToModalDetailPay,
      propsToMsgGeneratePayroll
    }
  )
}
