import { useState, useEffect } from 'react'
import { IntlMessages } from "@Helpers/Utils";
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';
import { getMonthLetter } from '@Helpers/Utils';
import { isClosed, canModify, nextStatus, buildYearMonths } from './schedulingRules';

export const useScheduling = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [dataCalendar, setDataCalendar] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const schedulingValid = {
    dateIn: [(val) => val !== "", "msg.required.input.dateIn"],
    dateOut: [(val) => val !== "", "msg.required.input.dateOut"]
  }

  const { formState, formValidation, isFormValid, onResetForm, setBulkForm, onInputChange } = useForm({
    id: 0,
    dateIn: '',
    dateOut: '',
    period: '',
    status: 0
  }, schedulingValid);

  // Un período cerrado no se edita ni se elimina: primero hay que reabrirlo.
  const fnDeleteItem = (item) => {
    if (!canModify(item)) {
      notification('warning', 'page.scheduling.msg.closed', 'alert.warning.title');
      return;
    }
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  };

  const fnEditItem = (item) => {
    if (!canModify(item)) {
      notification('warning', 'page.scheduling.msg.closed', 'alert.warning.title');
      return;
    }
    setBulkForm(item);
  };

  // Cerrar un período abierto, o reabrir uno cerrado (el back exige el privilegio 11.01.019 para reabrir).
  const fnToggleClosed = (item) => {
    setLoading(true);
    request.PUT(`banks/settings/banksCalendar/${item.id}`, { status: nextStatus(item) }, () => {
      fnGetData();
      fnClearInputs();
    }, () => setLoading(false));
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.scheduling.table.title"),
    columns: [
      { text: IntlMessages("page.scheduling.table.mont"), dataField: "month", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.scheduling.table.dateIn"), dataField: "dateIn", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.scheduling.table.dateOut"), dataField: "dateOut", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("page.scheduling.table.closed"), dataField: "status", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell',
        cell: ({ row }) => {
          return isClosed(row.original)
            ? <i className="medium-icon bi bi-lock-fill" />
            : <i className="medium-icon bi bi-unlock" />
        }
      }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: 'button.edit',
      onClick: fnEditItem,
      title: IntlMessages('button.edit')
    }, {
      color: 'info',
      icon: 'lock',
      toolTip: 'page.scheduling.button.toggleClosed',
      onClick: fnToggleClosed,
      title: IntlMessages('page.scheduling.button.toggleClosed')
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnDeleteItem,
      title: IntlMessages('button.delete')
    }],
    options: {
      enabledActionButtons: true
    }
  });

  const fnFilterCalendar = () => {
    if (formState.period === "" || formState.period.trim().length < 4) {
      notification('warning', 'msg.required.input.period', 'alert.warning.title');
      return;
    }

    const newDataCalendar = dataCalendar.filter((item) => {
      return item.year === validInt(formState.period);
    });

    const tableData = {
      ...table, data: newDataCalendar
    }
    setTable(tableData);
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGenerateYear = () => {
    const year = validInt(formState.period);
    if (formState.period === "" || formState.period.trim().length < 4 || year <= 0) {
      notification('warning', 'msg.required.input.generateYear', 'alert.warning.title');
      return;
    }

    const existingMonths = dataCalendar.filter((item) => item.year === year).map((item) => item.month);
    const monthsToCreate = buildYearMonths(year, existingMonths, getMonthLetter);

    if (monthsToCreate.length === 0) {
      notification('info', 'msg.info.yearAlreadyGenerated', 'alert.info.title');
      return;
    }

    setLoading(true);
    let pending = monthsToCreate.length;
    const fnDone = () => {
      pending -= 1;
      if (pending === 0) {
        fnGetData();
        setLoading(false);
      }
    }
    monthsToCreate.forEach((data) => {
      request.POST('banks/settings/banksCalendar', data, fnDone, fnDone, false);
    });
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('banks/settings/banksCalendar', (resp) => {
      const data = resp.data.map((item) => {
        item.year = new Date(`${item.dateIn}T12:00:00Z`).getFullYear()
        return item;
      });
      setDataCalendar(data);
      const tableData = {
        ...table, data
      }
      setTable(tableData);
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

    const month = getMonthLetter(formState.dateIn);

    formState.month = month;

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`banks/settings/banksCalendar/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('banks/settings/banksCalendar', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.DELETE(`banks/settings/banksCalendar/${currentItem.id}`, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      fnClearInputs,
      fnSave,
      fnFilterCalendar,
      fnGenerateYear,
      onInputChange
    }
  )
}
