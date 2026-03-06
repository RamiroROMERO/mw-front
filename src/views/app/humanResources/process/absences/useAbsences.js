import { API_URLS } from '@/helpers/APIUrl';
import { request } from '@/helpers/core';
import { validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';

export const useAbsences = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [dataAbsences, setDataAbsences] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const documentValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== "", "msg.required.select.dateEnd"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    date: '',
    dateStart: '',
    dateEnd: '',
    notes: ''
  }, documentValid);

  const { id, date, dateStart, dateEnd, employeeId, notes } = formState;

  const fnClear = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`${API_URLS.RRHH_PROC_ABSENCES}`, (resp) => {
      const data = resp.data.map((item) => {
        item.employee = `${item.employeeData.firstName} ${item.employeeData.secondName} ${item.employeeData.lastName}
        ${item.employeeData.secondLastName}`
        item.statusIcon = item.status === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataAbsences(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST(`${API_URLS.RRHH_PROC_ABSENCES}`, formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`${API_URLS.RRHH_PROC_ABSENCES}/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnConfirmDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`${API_URLS.RRHH_PROC_ABSENCES}/${id}`, (resp) => {
      fnGetData();
      fnClear();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();

    setLoading(true);
    request.GET('rrhh/process/employees/findSL?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }, []);

  const propsToDetail = {
    date,
    dateStart,
    dateEnd,
    employeeId,
    notes,
    listEmployees,
    onInputChange,
    formValidation,
    sendForm,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    dataAbsences,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDelete,
    fnOnNo: onResetForm,
    title: "alert.question.title"
  }

  return (
    {
      propsToMsgDelete,
      propsToDetail,
      propsToDetailTable
    }
  )
}
