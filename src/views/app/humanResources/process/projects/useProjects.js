import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const useProjects = ({ setLoading, screenControl, adminControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const enableMoveEmployees = adminControl.find(ctrl => ctrl.code === "07.02.011")?.active || false;
  const [listCustomers, setListCustomers] = useState([]);
  const [dataProjects, setDataProjects] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [openModalMoveEmployees, setOpenModalMoveEmployees] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listWorkShifts, setListWorkShifts] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);

  const projectsValid = {
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val.length > 5, "msg.required.input.name"],
    initDate: [(val) => val !== "", "msg.required.select.dateStart"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    customerId: 0,
    code: '',
    name: '',
    description: '',
    initDate: '',
    markAssistance: 0,
    status: 1
  }, projectsValid);

  const { id } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projects = resp.data.map((item) => {
        item.customer = item.facCliente ? item.facCliente.nomcli : ''
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataProjects(projects);

      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id,
          customerId: item.customerId,
          code: item.code,
          corre: item.corre
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/projects', formState, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/projects/${id}`, formState, () => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnOkDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/projects/${id}`, () => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
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
    request.GET('rrhhSchedules', (resp) => {
      const workShifts = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListWorkShifts(workShifts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/employees/findSL', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          value: item.id
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToDetailProject = {
    ...formState,
    listCustomers,
    onInputChange,
    sendForm,
    formValidation,
    fnSave,
    fnClearInputs
  }

  const propsToDetailTable = {
    dataProjects,
    setBulkForm,
    fnDelete,
    fnCreate,
    enableMoveEmployees,
    setCurrentItem,
    setOpenModalDetail,
    setOpenMsgQuestion,
    setOpenModalMoveEmployees
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      currentItem,
      openModalDetail,
      openModalMoveEmployees,
      listWorkShifts,
      listEmployees,
      listProjects,
      listCustomers,
      setOpenModalDetail,
      setOpenModalMoveEmployees,
      fnGetProjects: fnGetData,
      propsToDetailProject,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
