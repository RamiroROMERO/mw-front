import React, { useEffect, useState } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validFloat, validInt, IntlMessages } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from '@Components/reactTable'
import notification from '@Containers/ui/Notifications';
import Modal from '@Components/modal';
import DetailPayment from './DetailPayment'
import DetailTable from './DetailTable'
import ModalViewPayPlans from './ModalViewPayPlans'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const PaymentPlans = ({ setLoading }) => {
  const [projectId, setProjectId] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listTypeDeductions, setListTypeDeductions] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [dataPaymentPlans, setDataPaymentPlans] = useState([]);
  const [dataPayPlanDetail, setDataPayPlanDetail] = useState([]);
  const [openModalPaymentPlans, setOpenModalPaymentPlans] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const paymentPlansValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    // employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    description: [(val) => val.length > 5, "msg.required.input.description"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    valueQuote: [(val) => validFloat(val) > 0, "msg.required.input.valueQuote"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    valueCapital: [(val) => validFloat(val) > 0, "msg.required.input.valueCapital"],
    // deductionMethod: [(val) => validInt(val) > 0, "msg.required.select.deductionMethod"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    typeId: 0,
    employeeId: 0,
    employeeName: '',
    description: '',
    value: 0,
    noQuotes: 0,
    valueQuote: 0,
    valueInterest: 0,
    valueCapital: 0,
    dateStart: '',
    deductionMethod: 0,
    notes: ''
  }, paymentPlansValid);

  const { id, date, typeId, employeeId, employeeName, value, noQuotes, valueQuote, valueInterest, valueCapital, dateStart, deductionMethod, description, notes } = formState;

  const onProjectChange = e =>{
    const project = e.target.value;
    setProjectId(project);
    setSelectedItems([]);
  }

  const onCapitalChange = e => {
    const totalCapital = e.target.value;

    const totalValue = validFloat(totalCapital) + validFloat(valueInterest);

    const newValue = {
      value: totalValue,
      valueCapital: totalCapital
    }

    setBulkForm(newValue);
  }

  const onInterestChange = e => {
    const totalInterest = e.target.value;

    const totalValue = validFloat(totalInterest) + validFloat(valueCapital);

    const newValue = {
      value: totalValue,
      valueInterest: totalInterest
    }

    setBulkForm(newValue);
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

  const fnNewPaymentPlan = () => {
    onResetForm();
    setSendForm(false);
    setDataPayPlanDetail([]);
    setSelectedItems([]);
    setProjectId(0);
  }

  const fnSearchPaymentPlan = () => {
    setLoading(true);
    request.GET('rrhh/process/paymentPlans', (resp) => {
      const paymentPlans = resp.data.map((item) => {
        item.employee = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} 
        ${item.rrhhEmployee.secondLastName}`
        item.dateStart = item.dateStart===null?'1900-01-01':item.dateStart
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPaymentPlans(paymentPlans);
      setOpenModalPaymentPlans(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewPaymentPlans = (idPlan) => {
    setLoading(true);
    request.GET(`rrhh/process/paymentPlanDetails?fatherId=${idPlan}`, (resp) => {
      const paymentPlanDeta = resp.data.map((item, idx) => {
        item.quota = idx + 1
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPayPlanDetail(paymentPlanDeta);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      typeId,
      description,
      value,
      noQuotes,
      valueQuote,
      valueInterest,
      valueCapital,
      dateStart,
      deductionMethod: 3,
      notes
    }

    if (id === 0) {
      selectedItems.forEach(item => {
        const newData = {
          employeeId: item.value,
          date,
          typeId,
          description,
          value,
          noQuotes,
          valueQuote,
          valueInterest,
          valueCapital,
          dateStart,
          deductionMethod: 3,
          notes
        }

        setLoading(true);
        request.POST('rrhh/process/paymentPlans', newData, (resp) => {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
          setSendForm(false);
          setLoading(false);
          // Generar cuotas
          setLoading(true);
          request.POST(`rrhh/process/paymentPlans/generateDetail/${resp.data.id}`, newData, () => {
            fnViewPaymentPlans(resp.data.id);
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/paymentPlans/${id}`, updateData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintPaymentPlan = () => { }

  const fnCancelPaymentPlan = () => {
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
    request.PUT(`rrhh/process/paymentPlans/${id}`, editData, () => {
      fnNewPaymentPlan();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnDeletePaymentPlan = () => {
    if (id > 0) {
      setOpenMsgDelete(true);
    }
  }

  const fnOkDelete = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`rrhh/process/paymentPlans/${id}`, (resp) => {
      console.log(resp);
      fnNewPaymentPlan();
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/deductionTypes', (resp) => {
      const listTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          noAccount: item.noAccount
        }
      });
      setListTypeDeductions(listTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(()=>{
    const dataTable = {...table, data: listEmployeesByProject};
    setTable(dataTable);
  },[listEmployeesByProject]);

  useEffect(()=>{
    const filterEmployees = listEmployees.filter(item => item.projectId === projectId);
    setListEmployeesByProject(filterEmployees);
  },[projectId]);

  const propsToControlPanel = {
    fnNew: fnNewPaymentPlan,
    fnSearch: fnSearchPaymentPlan,
    fnSave: fnSavePaymentPlan,
    fnPrint: fnPrintPaymentPlan,
    fnCancel: fnCancelPaymentPlan,
    fnDelete: fnDeletePaymentPlan,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailPayment = {
    date,
    typeId,
    employeeId,
    employeeName,
    value,
    noQuotes,
    valueQuote,
    valueCapital,
    valueInterest,
    dateStart,
    deductionMethod,
    description,
    notes,
    listEmployees,
    listTypeDeductions,
    listEmployeesByProject,
    onInputChange,
    formValidation,
    sendForm,
    setBulkForm,
    onCapitalChange,
    onInterestChange
  }

  const propsToDetailTable = {
    dataPayPlanDetail
  }

  const propsToModalPaymentPlan = {
    ModalContent: ModalViewPayPlans,
    title: "page.paymentPlans.modal.viewPaymentPlans.title",
    open: openModalPaymentPlans,
    setOpen: setOpenModalPaymentPlans,
    maxWidth: 'lg',
    data: {
      dataPaymentPlans,
      setBulkForm,
      setDataPayPlanDetail,
      setLoading,
      fnViewPaymentPlans
    }
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
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <Row>
                <Colxx xxs="12">
                  <DetailPayment {...propsToDetailPayment} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" lg="6" xl="5" className="mb-3">
                  <Row>
                    <Colxx xxs={12}>
                      <SearchSelect
                        label='select.project'
                        name='projectId'
                        inputValue={projectId}
                        options={listProjects}
                        onChange={onProjectChange}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <ReactTable {...table}/>
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs="12" lg="6" xl="7">
                  <DetailTable {...propsToDetailTable} />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPaymentPlan} />
      <Confirmation {...propsToMsgCancel} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default PaymentPlans