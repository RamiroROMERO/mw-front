import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { IntlMessages, formatDate, validFloat, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useModalDetail = ({ currentItem, setLoading, fnGetProjects, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [nextCode, setNextCode] = useState(0);
  const [codeEmployee, setCodeEmployee] = useState('');
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const projectsValid = {
    turnId: [(val) => validInt(val) > 0, "msg.required.select.turnId"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    dateIn: [(val) => val !== '', "msg.required.select.dateIn"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    turnId: 0,
    employeeId: '',
    dateIn: '',
    dateOut: '',
    status: 1
  }, projectsValid);

  const { id, turnId, employeeId, dateIn, dateOut } = formState;

  const fnEditDetail = (item) => {
    item.dateOut = item.dateOut==="1900-01-01"?"":item.dateOut
    setCodeEmployee(item?.codeEmployee || '')
    onBulkForm(item);
  }

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
  }

  const fnDeleteDetail = (item) => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnConfirmDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/projectDetail/${id}`, (resp) => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.detail.title"),
    columns: [
      {
        text: IntlMessages("table.column.code"),
        dataField: "codeEmployee",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("select.workShifts"),
        dataField: "workShifts",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "35%" }
      },
      {
        text: IntlMessages("select.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "15%" },
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("select.dateOut"),
        dataField: "dateOutVal",
        headerStyle: { width: "15%" },
        cell:({row})=>{
          return (row.original.dateOutVal===""?"":formatDate(row.original.dateOutVal));
        }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      },
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: true,
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditDetail,
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.edit"),
        onClick: fnDeleteDetail,
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/projectDetail?projectId=${currentItem.id}&status=1`, (resp) => {
      const projectDeta = resp.data.map((item) => {
        item.workShifts = item.rrhhSchedule?.name || ''
        item.employee = `${item.rrhhEmployee?.firstName || ''} ${item.rrhhEmployee?.secondName || ''} ${item.rrhhEmployee?.lastName || ''} ${item.rrhhEmployee?.secondLastName || ''}`
        item.dateOutVal = item.dateOut==="1900-01-01"?"":item.dateOut
        item.statusIcon = item.status === true || item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setTable({ ...table, data: projectDeta });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      customerId: currentItem.customerId,
      projectId: currentItem.id,
      turnId,
      dateIn,
      dateOut: dateOut===""?"1900-01-01":dateOut,
      employeeId,
      codeEmployee
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/projectDetail', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnGetData();
        onResetForm();
        setSendForm(false);

        // actualizar correlativo del proyecto
        const dataUpdate = {
          corre: nextCode
        }
        setLoading(true);
        request.PUT(`rrhh/process/projects/${currentItem.id}`, dataUpdate, () => {
          setLoading(false);
          const nextCodeP = validFloat(nextCode) + 1;
          const codeEmpl = `${currentItem.code}-${nextCodeP}`;
          setCodeEmployee(codeEmpl);
          setNextCode(nextCodeP);
          fnGetProjects();
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/projectDetail/${id}`, newData, () => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fnGetData();

    const nextCodeP = validFloat(currentItem.corre) + 1;
    const codeEmpl = `${currentItem.code}-${nextCodeP}`;
    setCodeEmployee(codeEmpl);
    setNextCode(nextCodeP);
  }, []);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      codeEmployee,
      formState,
      formValidation,
      sendForm,
      onInputChange,
      table,
      propsToMsgDelete,
      fnSave,
      fnClearInputs
    }
  )
}
