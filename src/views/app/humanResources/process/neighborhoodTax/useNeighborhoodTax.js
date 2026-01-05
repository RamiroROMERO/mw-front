import { useEffect, useState } from 'react'
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useNeighborhoodTax = ({ setLoading, typePayroll, screenControl }) => {
  const currentYear = new Date().getFullYear();
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [customerName, setCustomerName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listProjectsFilter, setListProjectsFilter] = useState([]);
  const [dataDetailPayroll, setDataDetailPayroll] = useState([]);
  const [dataPayrolls, setDataPayrolls] = useState([]);
  const [dataTotals, setDataTotals] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [openModalPayrolls, setOpenModalPayrolls] = useState(false);

  const formValidations = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    date: '',
    customerId: 0,
    projectId: 0,
    dateStart: `${currentYear}-01-01`,
    dateEnd: `${currentYear}-12-31`,
    notes: ''
  }, formValidations);

  const { id, date, customerId, projectId, dateStart, dateEnd, notes } = formState;

  const onCustomerChange = e => {
    const custId = validInt(e.target.value);

    const filter = listProjects.filter((item) => {
      return item.customerId === custId
    });

    setListProjectsFilter(filter);

    onBulkForm({ customerId: custId, projectId: 0 });
  }

  const fnNewPayroll = () => {
    onResetForm();
    setSendForm();
    setDataDetailPayroll([]);
    setDataTotals({});
  }

  const fnGetPayrolls = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (validInt(customerId) === 0) {
      notification('warning', 'msg.required.select.customer', 'alert.warning.title');
      return
    }
    if (validInt(projectId) === 0) {
      notification('warning', 'msg.required.select.project', 'alert.warning.title');
      return
    }

    const filterCustomers = listCustomers.find(item => item.value === customerId);
    setCustomerName(filterCustomers ? filterCustomers.label : '');

    const filterProjects = listProjectsFilter.find(item => item.value === projectId);
    setProjectName(filterProjects ? filterProjects.label : '');

    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrolls?customerId=${customerId}&projectId=${projectId}&typeId=${typePayroll}`, (resp) => {
      const payrollWeekly = resp.data.map((item) => {
        item.dateVal = formatDate(item.date)
        item.startDate = formatDate(item.dateStart)
        item.endDate = formatDate(item.dateEnd)
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPayrolls(payrollWeekly);
      setOpenModalPayrolls(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnViewDetailPayroll = (idPayroll) => {
    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrollDetails/payrollDetail?fatherId=${idPayroll}`, (resp) => {
      const payrollDeta = resp.data.map(item => {
        item.employee = `${item.rrhhEmployee?.firstName} ${item.rrhhEmployee?.secondName} ${item.rrhhEmployee?.lastName} ${item.rrhhEmployee?.secondLastName}` || ''
        item.jobPosition = item.rrhhJobPosition?.name || ''
        item.totalPaymentValue = formatNumber(validFloat(item.totalPayment))
        item.totalIncomesValue = formatNumber(validFloat(item.totalIncomes))
        item.turnName = item.rrhhSchedule?.name || ''
        return item;
      });
      setDataDetailPayroll(payrollDeta);
      setDataTotals(resp.dataTotals);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGeneratePayroll = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      typeId: typePayroll,
      date,
      customerId,
      projectId,
      dateStart: dateStart === "" ? date : dateStart,
      dateEnd: dateEnd === "" ? date : dateEnd,
      notes,
      status: 1,
      userId: userData.id
    }

    setLoading(true);
    request.POST('rrhh/process/weeklyPayrolls/generateNeighborhoodPayroll', newData, (resp) => {
      if (validInt(resp.data.id) > 0) {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
      }
      fnViewDetailPayroll(resp.data.id);
      setSendForm(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnPrintPayroll = async () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setLoading(true);
      let data = {
        where: {
          id
        },
        fields: [
          { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
          { title: 'Cargo', field: 'positionName', type: 'String', length: 70, isSum: false, curreny: false },
          { title: 'Forma de Pago', field: 'paymentMethod', type: 'String', length: 70, isSum: false, curreny: false },
          { title: 'Ingreso Quincenal', field: 'incWeekly', type: 'decimal', length: 50, isSum: true, currency: true },
          { title: 'Total Ingresos Anual', field: 'totalIncomes', type: 'decimal', length: 50, isSum: true, currency: true },
          { title: 'Total Pago', field: 'totalPayment', type: 'decimal', length: 50, isSum: true, currency: true }
        ],
        otherFields: [],
        otherFields2: [],
        headerData: [],
        reportTitle: "Planilla de Impuesto Vecinal",
        nameXLSXFile: "Planilla de Impuesto Vecinal.xlsx",
      };
      await request.fnExportToXLSX("rrhh/process/weeklyPayrolls/exportPayrollXLXS", data, "Planilla de Impuesto Vecinal.xlsx");
      setLoading(false);
    }
  }

  const propsToControlPanel = {
    fnNew: fnNewPayroll,
    fnSearch: fnGetPayrolls,
    buttonsHome: [
      {
        title: "button.generatePayroll",
        icon: "bi bi-cash-coin",
        onClick: fnGeneratePayroll
      },
      {
        title: "button.export",
        icon: "bi bi-file-earmark-excel",
        onClick: fnPrintPayroll
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: [],
    disableTab: [false, true, true]
  }

  useEffect(() => {
    setLoading(true);
    request.GET('billing/settings/customers?status=1', (resp) => {
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

      setLoading(false);
    });
  }, []);

  const propsToHeaderPayroll = {
    date,
    customerId,
    projectId,
    dateStart,
    dateEnd,
    notes,
    listCustomers,
    listProjectsFilter,
    onInputChange,
    sendForm,
    formValidation,
    onCustomerChange
  }

  const propsToDetailTable = {
    dateStart,
    dateEnd,
    dataDetailPayroll,
    setLoading,
    fnViewDetailPayroll
  }

  const propsToModalViewPayroll = {
    customerName,
    projectName,
    dataPayrolls,
    onBulkForm,
    listProjects,
    setListProjectsFilter,
    fnViewDetailPayroll
  }

  return (
    {
      dataTotals,
      propsToControlPanel,
      propsToHeaderPayroll,
      propsToDetailTable,
      propsToModalViewPayroll,
      openModalPayrolls,
      setOpenModalPayrolls
    }
  )
}
