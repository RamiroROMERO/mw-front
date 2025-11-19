import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications'
import ViewPdf from '@/components/ViewPDF/ViewPdf';

export const useResumePayroll = ({ setLoading, typePayroll, screenControl, adminControl }) => {
  const currentYear = new Date().getFullYear();
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const enableDeletePayroll = adminControl.find(ctrl => ctrl.code === "07.02.016")?.active || false;
  const enableConfidentialPayroll = adminControl.find(ctrl => ctrl.code === "07.02.021")?.active || false;
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [employeeId, setEmployeeId] = useState(0);
  const [typeSheet, setTypeSheet] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listProjectsFilter, setListProjectsFilter] = useState([]);
  const [listTypeDeductions, setListTypeDeductions] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [listJobPositions, setListJobPositions] = useState([]);
  const [listPaymentMethod, setListPaymentMethod] = useState([]);
  const [listSchedules, setListSchedules] = useState([]);
  const [listTypeIncomes, setListTypeIncomes] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [dataPayrolls, setDataPayrolls] = useState([]);
  const [dataDetailPayroll, setDataDetailPayroll] = useState([]);
  const [dataTotals, setDataTotals] = useState({});
  const [openModalPayrolls, setOpenModalPayrolls] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openModalDeductions, setOpenModalDeductions] = useState(false);
  const [openModalIncomes, setOpenModalIncomes] = useState(false);
  const [openModalSelectEmployees, setOpenModalSelectEmployees] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  //print invoice
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const formValidations = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    dateStart: [(val) => val !== "", "msg.required.input.dateIn"],
    dateEnd: [(val) => val !== "", "msg.required.input.dateOut"]
  }

  const formValidations2 = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    date: '',
    customerId: 0,
    projectId: 0,
    dateStart: typePayroll===1?"":(typePayroll===2?`${currentYear}-01-01`:(typePayroll===3?`${currentYear-1}-07-01`:"")),
    dateEnd: typePayroll===1?"":(typePayroll===2?`${currentYear}-12-31`:(typePayroll===3?`${currentYear}-06-30`:"")),
    isConfidential: 0,
    notes: ''
  }, typePayroll===1?formValidations:formValidations2);

  const { id, date, customerId, projectId, dateStart, dateEnd, isConfidential, notes } = formState;

  const fnNewPayroll = () => {
    onResetForm();
    setSendForm();
    setDataDetailPayroll([]);
    setDataTotals([]);
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
    request.GET(`rrhh/process/weeklyPayrolls?customerId=${customerId}&projectId=${projectId}&typeId=${typePayroll}&status=1`, (resp) => {
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetPayrollsConfidential = () => {
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

    const filterConfidential = enableConfidentialPayroll === true ? 1 : 0;

    const filterCustomers = listCustomers.find(item => item.value === customerId);
    setCustomerName(filterCustomers ? filterCustomers.label : '');

    const filterProjects = listProjectsFilter.find(item => item.value === projectId);
    setProjectName(filterProjects ? filterProjects.label : '');

    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrolls?customerId=${customerId}&projectId=${projectId}&typeId=${typePayroll}&status=1&isConfidential=${filterConfidential}`, (resp) => {
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewDetailPayroll = (idPayroll) => {
    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrollDetails/payrollDetail?fatherId=${idPayroll}`, (resp) => {
      const payrollDeta = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.employee = `${item.rrhhEmployee?.firstName} ${item.rrhhEmployee?.secondName} ${item.rrhhEmployee?.lastName} ${item.rrhhEmployee?.secondLastName}` || ''
        item.jobPosition = item.rrhhJobPosition?.name || ''
        item.totalIncomesValue = formatNumber(validFloat(item.totalIncomes))
        item.totalDeductionsValue = formatNumber(validFloat(item.totalDeductions))
        item.totalPaymentValue = formatNumber(validFloat(item.totalPayment))
        item.turnName = item.rrhhSchedule?.name || ''
        item.dateIn = formatDate(item.rrhhEmployee.dateIn)
        return item;
      });
      setDataDetailPayroll(payrollDeta);
      setDataTotals(resp.dataTotals);
      setLoading(false);
    }, (err) => {
      console.error(err);
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

      const otherFields = [];
      const qtyDaysFields = [];

      listTypeIncomes.map((item)=>{
        otherFields.push({
          id: item.value,
          title: `Total ${item.label}`,
          field: `inc${item.value}`,
          type: 'decimal',
          length: 50,
          isSum: true,
          currency: true
        },{
          id: `qty-${item.value}`,
          title: `Cantidad ${item.label}`,
          field: `incQty${item.value}`,
          type: 'decimal',
          length: 50,
          isSum: false,
          currency: false
        });

        qtyDaysFields.push({
          id: `qtyDays-${item.value}`,
          title: `${item.label}`,
          field: `incQtyDays${item.value}`,
          type: 'decimal',
          length: 40,
          isSum: false,
          currency: false
        });
      });

      const otherFields2 = listTypeDeductions.map((item)=>{
        return {
          id: item.value,
          title: item.label,
          field: `deduc${item.value}`,
          type: 'decimal',
          length: 60,
          isSum: true,
          currency: true
        }
      });

      let data = {
        where: {
          id
        },
        fields: [
          { title: 'No.', field: 'num', type: 'decimal', length: 20 },
          { title: 'Identidad', field: 'dni', type: 'String', length: 50 },
          { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
          { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 40},
          { title: 'Cargo', field: 'positionName', type: 'String', length: 70, isSum: false, curreny: false },
          { title: 'Forma de Pago', field: 'paymentMethod', type: 'String', length: 70, isSum: false, curreny: false },
          { title: 'Salario Base Mensual', field: 'montlySalary', type: 'decimal', length: 50, isSum: true, currency: true },
          { title: 'Salario Quincenal', field: 'incWeekly', type: 'decimal', length: 50, isSum: true, currency: true },
          { title: 'Dias Vacaciones Gozadas', field: 'daysVacationTaken', type: 'decimal', length: 50, isSum: false, currency: false },
          ...qtyDaysFields,
          { title: typePayroll===4?'Dias Vacaciones: ':'Total Dias', field: 'totalDays', type: 'decimal', length: 40, isSum: false, currency: false },
          ...otherFields,
          { title: 'Total Ingresos', field: 'totalIncomes', type: 'decimal', length: 50, isSum: true, currency: true },
          ...otherFields2,
          { title: 'Total Deducciones', field: 'totalDeductions', type: 'decimal', length: 50, isSum: true, currency: true },
          { title: 'Total Pago', field: 'totalPayment', type: 'decimal', length: 50, isSum: true, currency: true }
        ],
        otherFields,
        otherFields2,
        qtyDaysFields,
        headerData: [],
        reportTitle: "Planilla Quincenal",
        nameXLSXFile: "Planilla.xlsx",
      };
      await request.fnExportToXLSX("rrhh/process/weeklyPayrolls/exportPayrollXLXS", data, "Planilla.xlsx");
      setLoading(false);
    }
  }

  const fnPrintPayrollPdf = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setLoading(true);

      const dataPrint = {
        id
      }

      request.GETPdf('rrhh/process/weeklyPayrolls/exportPDFPayroll', dataPrint, 'Planilla Quincenal.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
      setLoading(false);
    }
  }

  const fnGeneratePayroll = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      typeId: typePayroll,
      date,
      customerId,
      projectId,
      dateStart: dateStart===""?date:dateStart,
      dateEnd: dateEnd===""?date:dateEnd,
      notes,
      status: 1,
      isConfidential,
      userId: userData.id
    }

    if(typePayroll===1){
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/weeklyPayrolls/generatePayroll', newData, (resp) => {
        if (validInt(resp.data.id) > 0) {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
        }
        fnViewDetailPayroll(resp.data.id);
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else if(typePayroll===2 || typePayroll===3){
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/weeklyPayrolls/generateOtherPayroll', newData, (resp) => {
        if (validInt(resp.data.id) > 0) {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
        }
        fnViewDetailPayroll(resp.data.id);
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else{

      // mostrar modal para seleccionar los empleados a los que se les generara la planilla
      request.GET(`rrhh/process/vacations/getVacationByProject?status=1&projectId=${projectId}`, (resp) => {
        const employees = resp.data.map((item) => {
          item.id = item.employeeId
          item.daysToPay = 0
          return item
        });
        const filterEmployees = employees.filter(item => item.daysPending > 0);
        setListEmployeesByProject(filterEmployees);
        setOpenModalSelectEmployees(true);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintPaymentReceipt = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setEmployeeId(0);
      setOpenModalPrint(true);
    }
  }

  const fnPrintDocument = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    const dataPrint = {
      id,
      typeSheet,
      employeeId,
      userName: userData.name
    }

    request.GETPdfUrl('rrhh/process/weeklyPayrolls/exportPDFReceipt', dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnAddDeductions = ()=>{
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalDeductions(true);
    }
  }

  const fnAddIncomes = ()=>{
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if(id>0){
      setOpenModalIncomes(true);
    }
  }

  const fnCancelPayroll = () => {
    if (enableDeletePayroll === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if(id>0){
      setOpenMsgQuestion(true);
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`rrhh/process/weeklyPayrolls/${formState.id}`, data, () => {
        fnNewPayroll();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
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
    request.GET('rrhh/process/employees/findForPayroll', (resp) => {
      const employees = resp.data.map((item) => {
        item.value = item.id
        item.label = `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        return item;
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/jobPositions', (resp) => {
      const positions = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListJobPositions(positions);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/paymentMethods', (resp) => {
      const paymentMethod = resp.data;
      setListPaymentMethod(paymentMethod);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const rrhhSchedules = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListSchedules(rrhhSchedules);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/payrollDayTypes', (resp) => {
      const listTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          noAccount: item.noAccount
        }
      });
      setListTypeIncomes(listTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewPayroll,
    fnSearch: fnGetPayrolls,
    fnPrint: fnPrintPayrollPdf,
    fnCancel: fnCancelPayroll,
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
      },
      {
        title: "button.printPaymentReceipt",
        icon: "bi bi-printer",
        onClick: fnPrintPaymentReceipt
      },
      typePayroll===1?
      {
        title: "button.deductionsGeneral",
        icon: "bi bi-dash-circle",
        onClick: fnAddDeductions
      }:"",
      typePayroll===1?
      {
        title: "button.incomesGeneral",
        icon: "bi bi-plus-circle",
        onClick: fnAddIncomes
      }:"",
      enableConfidentialPayroll===true?
      {
        title: "button.payrollsConfidential",
        icon: "bi bi-eye-slash",
        onClick: fnGetPayrollsConfidential
      }:""
    ],
    buttonsOptions: [],
    buttonsAdmin: [],
    disableTab: [false, true, true]
  }

  const propsToHeaderPayroll = {
    typePayroll,
    date,
    customerId,
    projectId,
    dateStart,
    dateEnd,
    isConfidential,
    notes,
    listCustomers,
    listProjects,
    listProjectsFilter,
    setListProjectsFilter,
    onInputChange,
    onBulkForm,
    sendForm,
    formValidation,
    enableConfidentialPayroll
  }

  const propsToDetailTable = {
    idPayroll: id,
    typePayroll,
    dateStart,
    dateEnd,
    dataDetailPayroll,
    notes,
    listTypeDeductions,
    listEmployees,
    listJobPositions,
    listPaymentMethod,
    listSchedules,
    listTypeIncomes,
    setOpenModalPrint,
    setEmployeeId,
    setLoading,
    fnViewDetailPayroll,
    fnUpdate,
    fnDelete
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

  const propsToModalPrint = {
    typeSheet,
    setTypeSheet,
    disabledOpt: 3,
    fnPrintDocument
  }

  const propsToModalDeductions = {
    idPayroll: id,
    dataDetailPayroll,
    listTypeDeductions,
    setLoading,
    fnViewDetailPayroll
  }

  const propsToModalIncomes = {
    idPayroll: id,
    dataDetailPayroll,
    listTypeIncomes,
    setLoading,
    fnViewDetailPayroll
  }

  const propsToModalEmployees = {
    typeId: typePayroll,
    date,
    customerId,
    projectId,
    dateStart: dateStart===""?date:dateStart,
    dateEnd: dateEnd===""?date:dateEnd,
    notes,
    status: 1,
    userId: userData.id,
    listEmployeesByProject,
    setListEmployeesByProject,
    onInputChange,
    setLoading,
    setSendForm,
    fnViewDetailPayroll
  }

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: () => onResetForm
  };

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.proofPayment",
    // valueTitle: documentId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    {
      dataTotals,
      openModalPayrolls,
      openModalPrint,
      openModalDeductions,
      openModalIncomes,
      openModalSelectEmployees,
      setOpenModalPayrolls,
      setOpenModalPrint,
      setOpenModalDeductions,
      setOpenModalIncomes,
      setOpenModalSelectEmployees,
      propsToControlPanel,
      propsToDetailTable,
      propsToHeaderPayroll,
      propsToModalViewPayroll,
      propsToModalPrint,
      propsToModalDeductions,
      propsToModalIncomes,
      propsToModalEmployees,
      propsToMsgDelete,
      propsToViewPDF
    }
  )
}
