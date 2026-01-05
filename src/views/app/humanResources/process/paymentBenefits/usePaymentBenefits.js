import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validFloat, IntlMessages } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const usePaymentBenefits = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [projectId, setProjectId] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [dataPaymentBenefits, setDataPaymentBenefits] = useState([]);
  const [dataPayDetail, setDataPayDetail] = useState([]);
  const [openModalPayments, setOpenModalPayments] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const paymentsValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    description: [(val) => val.length > 5, "msg.required.input.description"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    valueQuote: [(val) => validFloat(val) > 0, "msg.required.input.valueQuote"],
    startDate: [(val) => val !== "", "msg.required.select.dateStart"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    employeeId: 0,
    employeeName: '',
    description: '',
    value: 0,
    noQuotes: 0,
    valueQuote: 0,
    startDate: '',
    notes: ''
  }, paymentsValid);

  const { id, date, employeeId, employeeName, value, noQuotes, valueQuote, startDate, description, notes } = formState;

  const onProjectChange = e => {
    const project = e.target.value;
    setProjectId(project);
    setSelectedItems([]);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.employees.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "label",
        headerStyle: { width: "100%" }
      },
    ],
    data: [],
    options: {
      pageSize: 5,
      enabledRowSelection: true,
      enabledActionButtons: false,
      setRowSelected: setSelectedItems
    }
  });

  const fnNewPayment = () => {
    onResetForm();
    setSendForm(false);
    setDataPayDetail([]);
    setSelectedItems([]);
    setProjectId(0);
  }

  const fnSearchPayments = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('rrhh/process/benefitsPaymentPlans', (resp) => {
      const payments = resp.data.map((item) => {
        item.employee = `${item?.employeeData?.firstName || ""} ${item?.employeeData?.secondName || ""} ${item?.employeeData?.lastName || ""} ${item?.employeeData?.secondLastName || ""}`
        item.startDate = item.startDate === null ? '1900-01-01' : item.startDate
        item.statusIcon = item.status === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPaymentBenefits(payments);
      setOpenModalPayments(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnViewPaymentDetail = (idPay) => {
    setLoading(true);
    request.GET(`rrhh/process/benefitsPaymentPlanDetails?idFather=${idPay}`, (resp) => {
      const paymentsDeta = resp.data.map((item) => {
        item.statusIcon = item.status === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPayDetail(paymentsDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSavePaymentPlan = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id === 0 && selectedItems.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const updateData = {
      date,
      description,
      value,
      noQuotes,
      valueQuote,
      startDate,
      notes
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      selectedItems.forEach(item => {
        const newData = {
          employeeId: item.value,
          date,
          description,
          value,
          noQuotes,
          valueQuote,
          startDate,
          notes
        }

        setLoading(true);
        request.POST('rrhh/process/benefitsPaymentPlans', newData, (resp) => {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
          setSendForm(false);
          setLoading(false);
          // Generar cuotas
          const dataDetail = { id: resp.data.id }
          setLoading(true);
          request.POST(`rrhh/process/benefitsPaymentPlans/generateCuotes`, dataDetail, (resp2) => {
            setDataPayDetail(resp2.data);
            setLoading(false);
          }, (err) => {

            setLoading(false);
          });
        }, (err) => {

          setLoading(false);
        });
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/benefitsPaymentPlans/${id}`, updateData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnPrintPayments = () => { }

  const fnCancelPayments = () => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnCancel = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const editData = {
      status: 0
    }
    request.PUT(`rrhh/process/benefitsPaymentPlans/${id}`, editData, () => {
      fnNewPayment();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDeletePayment = () => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenMsgDelete(true);
    }
  }

  const fnOkDelete = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`rrhh/process/benefitsPaymentPlans/${id}`, (resp) => {
      fnNewPayment();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/projectDetail?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.employeeId,
          label: `${item?.rrhhEmployee?.firstName || ""} ${item?.rrhhEmployee?.secondName || ""} ${item?.rrhhEmployee?.lastName || ""} ${item?.rrhhEmployee?.secondLastName}`,
          projectId: item.projectId
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const dataTable = { ...table, data: listEmployeesByProject };
    setTable(dataTable);
  }, [listEmployeesByProject]);

  useEffect(() => {
    const filterEmployees = listEmployees.filter(item => item.projectId === projectId);
    setListEmployeesByProject(filterEmployees);
  }, [projectId]);

  const propsToControlPanel = {
    fnNew: fnNewPayment,
    fnSearch: fnSearchPayments,
    fnSave: fnSavePaymentPlan,
    fnPrint: fnPrintPayments,
    fnCancel: fnCancelPayments,
    fnDelete: fnDeletePayment,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailPayment = {
    date,
    employeeId,
    employeeName,
    value,
    noQuotes,
    valueQuote,
    startDate,
    description,
    notes,
    listEmployees,
    listEmployeesByProject,
    onInputChange,
    formValidation,
    sendForm,
    setBulkForm
  }

  const propsToDetailTable = {
    dataPayDetail
  }

  const propsToMsgCancel = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnCancel,
    title: "msg.question.cancel.document.title"
  }

  const propsToMsgDelete = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnOkDelete,
    title: "alert.question.title"
  }

  return (
    {
      projectId,
      listProjects,
      dataPaymentBenefits,
      table,
      setBulkForm,
      openModalPayments,
      onProjectChange,
      setDataPayDetail,
      fnViewPaymentDetail,
      setOpenModalPayments,
      propsToControlPanel,
      propsToDetailPayment,
      propsToDetailTable,
      propsToMsgCancel,
      propsToMsgDelete
    }
  )
}
