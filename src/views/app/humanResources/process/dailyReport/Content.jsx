import React, { useEffect, useState } from 'react'
import { Card, CardBody, Row } from 'reactstrap'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import createNotification from '@Containers/ui/Notifications'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewReport from './ModalViewReport'
import DetailDailyReport from './DetailDailyReport'
import TableEmployees from './TableEmployees'

const DailyReport = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listManagers, setListManagers] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [listSchedules, setListSchedules] = useState([]);
  const [listDaysTypes, setListDaysTypes] = useState([]);
  const [employeesDetail, setEmployeesDetail] = useState([]);
  const [dataDailyReport, setDataDailyReport] = useState([]);
  const [filterProjects, setFilterProjects] = useState([]);
  const [openModalViewReport, setOpenModalViewReport] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const dailyReportValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    responsibleId: [(val) => validInt(val) > 0, "msg.required.select.manager"],
    scheduleId: [(val) => validInt(val) > 0, "msg.required.select.scheduleId"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    customerId: 0,
    projectId: 0,
    responsibleId: 0,
    scheduleId: 0,
    notes: '',
    status: 1
  }, dailyReportValid);

  const { formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } =
    useForm({
      employeeId: 0,
      dayTypeId: 0,
      isHoliday: 0
    });

  const { id, date, customerId, projectId, responsibleId, notes, scheduleId, status } = formState;

  const fnNewDailyReport = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setEmployeesDetail([]);
  }

  const fnSearchDailyReport = () => {
    if (date === "") {
      createNotification('warning', 'msg.required.input.date', 'alert.warning.title');
      return
    }
    setLoading(true);
    request.GET(`rrhh/process/dailyReports?date=${date}`, (resp) => {
      const dailyReports = resp.data.map((item) => {
        item.customer = item.facCliente ? item.facCliente.name : ""
        item.project = item.rrhhProject ? item.rrhhProject.name : ""
        item.manager = item.responsible ? `${item.responsible.firstName} ${item.responsible.secondName} ${item.responsible.lastName} ${item.responsible.secondLastName}` : ""
        item.turnName = item?.rrhhSchedule?.name || ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataDailyReport(dailyReports);
      setOpenModalViewReport(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveDailyReport = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (employeesDetail.length === 0) {
      createNotification('warning', 'msg.required.select.employees', 'alert.warning.title');
      return
    }

    const newData = {
      date,
      customerId,
      projectId,
      responsibleId,
      scheduleId,
      notes,
      status
    }

    employeesDetail.map((item) => {
      delete item.id;
      return item;
    });

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/dailyReports', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        // guardar empleados
        employeesDetail.forEach(item => {
          const employeesDeta = {
            fatherId: resp.data.id,
            ...item
          }
          setLoading(true);
          request.POST('rrhh/process/dailyReportDetail', employeesDeta, () => {
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          }, false);
        });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/dailyReports/${id}`, newData, () => {
        // Eliminar empleados
        request.DELETE(`rrhh/process/dailyReportDetail?fatherId=${id}`, () => {
          // guardar empleados
          employeesDetail.forEach(item => {
            const employeesDeta = {
              fatherId: id,
              ...item
            }
            setLoading(true);
            request.POST('rrhh/process/dailyReportDetail', employeesDeta, () => {
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
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintDailyReport = () => {
    if (date !== "") {
      const dataPrint = {
        date,
        userName: userData.name
      }
      if (customerId > 0) {
        dataPrint.customerId = customerId
      }
      if (projectId > 0) {
        dataPrint.projectId = projectId
      }
      request.GETPdf('rrhh/process/dailyReports/exportPDFDailyDeta', dataPrint, 'Reporte Diario Detallado.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnCancelDailyReport = () => {
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
    request.PUT(`rrhh/process/dailyReports/${id}`, editData, () => {
      onResetForm();
      setEmployeesDetail([]);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers?status=1&outsourcingBill=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projects = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          customerId: item.customerId
        }
      });
      setListProjects(projects);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/process/employees/findSL', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          areaManager: item.areaManager
        }
      });
      const filterManagers = employees.filter((item) => {
        return item.areaManager === 1
      });
      setListEmployees(employees);
      setListManagers(filterManagers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const schedules = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListSchedules(schedules);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    request.GET('rrhh/settings/payrollDayTypes', (resp) => {
      const dayTypes = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListDaysTypes(dayTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDailyReport,
    fnSearch: fnSearchDailyReport,
    fnSave: fnSaveDailyReport,
    fnPrint: fnPrintDailyReport,
    fnCancel: fnCancelDailyReport,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailDailyReport = {
    ...formState,
    listCustomers,
    listProjects,
    listManagers,
    listSchedules,
    filterProjects,
    setFilterProjects,
    setBulkForm,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToTableEmployees = {
    date,
    ...formStateDeta,
    listEmployees,
    listDaysTypes,
    employeesDetail,
    setEmployeesDetail,
    onInputChangeDeta,
    onResetFormDeta
  }

  const propsToModalViewReport = {
    ModalContent: ModalViewReport,
    title: "page.dailyReport.modal.viewReport.title",
    open: openModalViewReport,
    setOpen: setOpenModalViewReport,
    maxWidth: 'lg',
    data: {
      date,
      dataDailyReport,
      setEmployeesDetail,
      setBulkForm,
      setLoading,
      listProjects,
      setFilterProjects
    }
  }

  const propsToMsgCancel = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnCancel,
    title: "msg.question.cancel.document.title"
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
                <Colxx xxs="12" lg="5" xl="4">
                  <DetailDailyReport {...propsToDetailDailyReport} />
                </Colxx>
                <Colxx xxs="12" lg="7" xl="8">
                  <TableEmployees {...propsToTableEmployees} />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewReport} />
      <Confirmation {...propsToMsgCancel} />
    </>
  )
}

export default DailyReport