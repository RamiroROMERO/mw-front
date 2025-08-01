import React, { useEffect, useState } from 'react'
import { Card, CardBody, Row } from 'reactstrap'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { formatNumber, validFloat, validInt } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import createNotification from '@Containers/ui/Notifications'
import Modal from '@Components/modal';
import ModalManualPayroll from './ModalManualPayroll'
import FilterPayroll from './FilterPayroll'
import DetailPayroll from './DetailPayroll'
import FooterPayroll from './FooterPayroll'

const DailyPayroll = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listManagers, setListManagers] = useState([]);
  const [listSchedules, setListSchedules] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [listDaysTypes, setListDaysTypes] = useState([]);
  const [filterProjects, setFilterProjects] = useState([]);
  const [listProjectsFilter, setListProjectsFilter] = useState([]);
  const [dataPayrolls, setDataPayrolls] = useState([]);
  const [payrollDetail, setPayrollDetail] = useState([]);
  const [dataTotals, setDataTotals] = useState({});
  const [openModalManualPayroll, setOpenModalManualPayroll] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const dailyPayrollValid = {
    dateFilter: [(val) => val !== "", "msg.required.input.date"],
    customerIdFilter: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectIdFilter: [(val) => validInt(val) > 0, "msg.required.select.project"]
  }

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    customerId: 0,
    projectId: 0,
    responsibleId: 0,
    scheduleId: 0
  });

  const { formState: formStateFilter, formValidation, isFormValid, onInputChange: onInputChangeFilter, onResetForm: onResetFormFilter, setBulkForm: setBulkFormFilter } = useForm({
      dateFilter: '',
      customerIdFilter: 0,
      projectIdFilter: 0,
      previousPayroll: false
    }, dailyPayrollValid);

  const { id, date, customerId, projectId, responsibleId, scheduleId } = formState;

  const { dateFilter, customerIdFilter, projectIdFilter, previousPayroll } = formStateFilter;

  const fnNewDailyPayroll = () => {
    onResetForm();
    setPayrollDetail([]);
    setSendForm(false);
    setOpenModalManualPayroll(true);
  }

  const fnGetPayrollDetail = (fatherId) => {
    setLoading(true);
    request.GET(`rrhh/process/dailyPayrollDetails?fatherId=${fatherId}`, (resp) => {
      const reportDetail = resp.data.map((item) => {
        item.name = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        return item;
      });
      setPayrollDetail(reportDetail);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetPayrolls = () => {
    if (dateFilter === "") {
      createNotification('warning', 'msg.required.input.date', 'alert.warning.title');
      return
    }

    const params = {
      date: dateFilter,
      customerId: customerIdFilter,
      projectId: projectIdFilter
    }

    request.POST('rrhh/process/dailyPayrolls/findDetail', params, (resp) => {
      const payrolls = resp.data.map((item) => {
        item.customer = item.customerName
        item.project = item.projectName
        item.turnName = item.scheduleName
        item.regularValue = formatNumber(validFloat(item?.payrollTotals?.totalRegularValue || 0))
        item.overtimeValue = formatNumber(validFloat(item?.payrollTotals?.totalOvertimeValue || 0))
        item.total = formatNumber(validFloat(item?.payrollTotals?.totalValue || 0))
        return item;
      });
      setDataPayrolls(payrolls);
      setDataTotals(resp.dataTotals);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    }, false);
  }

  const fnPrintDailyPayroll = () => {
    if (dateFilter !== "") {
      const dataPrint = {
        date: dateFilter,
        userName: userData.name
      }
      if (customerIdFilter > 0) {
        dataPrint.customerId = customerIdFilter
      }
      if (projectIdFilter > 0) {
        dataPrint.projectId = projectIdFilter
      }
      request.GETPdf('rrhh/process/dailyPayrolls/exportPDFPayroll', dataPrint, 'Planilla Diaria.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnGeneratePayroll = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      date: dateFilter,
      customerId: customerIdFilter,
      projectId: projectIdFilter,
      previousPayroll
    }

    setLoading(true);
    request.POST('rrhh/process/dailyPayrolls/generatePayroll', newData, (resp) => {
      if (resp.data.lenght > 0) {
        onInputChange({ target: { name: 'id', value: resp.data[0].id } });
      }
      fnGetPayrolls();
      setSendForm(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    setDataPayrolls([]);
    setSendForm(false);
    onResetFormFilter();
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
          areaManager: item.areaManager,
          jobPosition: item.rrhhJobPosition.id
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
    buttonsHome: [],
    buttonsOptions: [
      {
        title: "button.manualPayroll",
        icon: "bi bi-file-earmark-plus",
        onClick: fnNewDailyPayroll
      },
      {
        title: "button.generatePayroll",
        icon: "bi bi-cash-coin",
        onClick: fnGeneratePayroll
      },
      {
        title: "button.print",
        icon: "bi bi-printer",
        onClick: fnPrintDailyPayroll
      }
    ],
    buttonsAdmin: [],
    activeTabDefault: "2",
    disableTab: [true, false, false]
  }

  const propsToFilterPayroll = {
    dateFilter,
    customerIdFilter,
    projectIdFilter,
    previousPayroll,
    listCustomers,
    listProjects,
    listProjectsFilter,
    setListProjectsFilter,
    setBulkFormFilter,
    onInputChangeFilter,
    fnGetPayrolls,
    formValidation,
    sendForm,
    fnClearInputs
  }

  const propsToDetailPayroll = {
    idPayroll: id,
    dataPayrolls,
    date,
    customerId,
    projectId,
    responsibleId,
    scheduleId,
    listCustomers,
    listProjects,
    listManagers,
    listSchedules,
    listEmployees,
    listDaysTypes,
    filterProjects,
    setFilterProjects,
    onInputChange,
    setBulkForm,
    setLoading,
    onResetForm,
    fnGetPayrollDetail,
    payrollDetail,
    setPayrollDetail,
    fnGetPayrolls
  }

  const propsToFooterPayroll = {
    dataTotals
  }

  const propsToModalManualPayroll = {
    ModalContent: ModalManualPayroll,
    title: "page.dailyPayroll.modal.manualPayroll.title",
    open: openModalManualPayroll,
    setOpen: setOpenModalManualPayroll,
    maxWidth: 'lg',
    data: {
      idPayroll: id,
      date,
      customerId,
      projectId,
      responsibleId,
      scheduleId,
      listCustomers,
      listProjects,
      listManagers,
      listSchedules,
      listEmployees,
      listDaysTypes,
      filterProjects,
      setFilterProjects,
      onInputChange,
      setBulkForm,
      setLoading,
      onResetForm,
      payrollDetail,
      setPayrollDetail,
      fnGetPayrolls
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <FilterPayroll {...propsToFilterPayroll} />
              <DetailPayroll {...propsToDetailPayroll} />
              <FooterPayroll {...propsToFooterPayroll}/>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalManualPayroll} />
    </>
  )
}

export default DailyPayroll