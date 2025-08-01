import { useState } from 'react'
import { validInt, IntlMessages, formatDate, validFloat } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

const useModalMoveEmployees = ({ setLoading, listProjects, fnGetProjects }) => {
  const [projectSourceId, setProjectSourceId] = useState(0);
  const [nextCode, setNextCode] = useState(0);
  const [codeProject, setCodeProject] = useState('');
  const [sendForm, setSendForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [listProjectsCust, setListProjectsCust] = useState([]);

  const projectsValid = {
    turnId: [(val) => validInt(val) > 0, "msg.required.select.turnId"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    dateIn: [(val) => val !== '', "msg.required.select.dateIn"],
    reason: [(val) => val !== '', "msg.required.input.reason"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    turnId: 0,
    customerId: 0,
    projectId: 0,
    dateIn: '',
    dateOut: '',
    reason: ''
  }, projectsValid);

  const { turnId, customerId, projectId, dateIn, dateOut, reason } = formState;

  const onProjectSourceChange = e => {
    const projectVal = e.target.value;

    fnGetData(projectVal);
    setProjectSourceId(projectVal);
  }

  const onCustomerChange = e => {
    const customer = e.target.value;

    const filterProjects = listProjects.filter(item => item.customerId === customer);
    setListProjectsCust(filterProjects);

    onBulkForm({ customerId: customer });
  }

  const onProjectDestinationChange = e =>{
    const project = e.target.value;

    const filterProjects = listProjects.find(item => item.id === project);

    const nextCodeP = validFloat(filterProjects.corre) + 1;
    const codeEmpl = `${filterProjects.code}-${nextCodeP}`;

    setNextCode(nextCodeP);
    setCodeProject(filterProjects.code);
    onBulkForm({ projectId: project, codeEmployee: codeEmpl });
  }

  const fnGetData = (idProject) => {
    setLoading(true);
    request.GET(`rrhh/process/projectDetail?projectId=${idProject}&status=1`, (resp) => {
      const projectDeta = resp.data.map((item) => {
        item.employee = `${item.rrhhEmployee?.firstName || ''} ${item.rrhhEmployee?.secondName || ''} ${item.rrhhEmployee?.lastName || ''} ${item.rrhhEmployee?.secondLastName || ''}`
        item.workShifts = item.rrhhSchedule?.name || ''
        return item;
      });
      setTable({ ...table, data: projectDeta });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnMoveEmployee = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (selectedItems.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    if (validInt(projectId) === 0 || validInt(turnId) === 0 || dateIn === "") {
      return
    }

    let nextCodeP = validFloat(nextCode)-1;
    const newData = selectedItems.map(item => {
      nextCodeP++;
      return {
        employeeId: item.employeeId,
        customerId,
        projectId,
        turnId,
        codeEmployee: `${codeProject}-${nextCodeP}`,
        dateIn,
        dateOut: dateOut===""?"1900-01-01":dateOut,
        reason,
        prevProjectId: item.projectId
      }
    });

    const dataUpdate = {
      dateOut: dateIn,
      status: 0
    }

    setLoading(true);
    request.POST('rrhh/process/projectDetail/createMany', newData, (resp) => {
      //actualizar proyecto anterior
      selectedItems.forEach(element => {
        setLoading(true);
        request.PUT(`rrhh/process/projectDetail/${element.id}`, dataUpdate, () => {
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
      });

      // actualizar correlativo del proyecto
      const dataUpdate2 = {
        corre: nextCodeP
      }
      setLoading(true);
      request.PUT(`rrhh/process/projects/${projectId}`, dataUpdate2, () => {
        setLoading(false);
        fnGetProjects();
      }, (err) => {
        console.error(err);
        setLoading(false);
      });

      setTable({ ...table, data: [] });
      fnGetData(projectSourceId);
      onResetForm();
      setSelectedItems([]);
      setSendForm(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.employees.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "60%" }
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "initDate",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("select.workShifts"),
        dataField: "workShifts",
        headerStyle: { width: "25%" }
      }
    ],
    data: [],
    options: {
      enabledRowSelection: true,
      enabledActionButtons: false,
      setRowSelected: setSelectedItems
    }
  });

  return (
    {
      projectSourceId,
      formState,
      formValidation,
      sendForm,
      table,
      listProjectsCust,
      onInputChange,
      onProjectSourceChange,
      onCustomerChange,
      onProjectDestinationChange,
      fnMoveEmployee
    }
  )
}

export default useModalMoveEmployees