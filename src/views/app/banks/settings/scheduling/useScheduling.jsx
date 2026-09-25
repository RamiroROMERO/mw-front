import { useState, useEffect } from 'react'
import { IntlMessages } from "@Helpers/Utils";
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';
import { getMonthLetter } from '@Helpers/Utils';

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
    status: true
  }, schedulingValid);

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  };

  const fnEditItem = (item) => {
    setBulkForm(item);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.scheduling.table.title"),
    columns: [
      { text: IntlMessages("page.scheduling.table.mont"), dataField: "month", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.scheduling.table.dateIn"), dataField: "dateIn", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.scheduling.table.dateOut"), dataField: "dateOut", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("page.scheduling.table.status"), dataField: "status", headerStyle: { 'width': '15%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell',
        cell: ({ row }) => {
          return (row.original.status === 1 || row.original.status === true)
            ? <i className="medium-icon bi bi-check2-square" />
            : <i className="medium-icon bi bi-square" />
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
    const monthsToCreate = [];
    for (let m = 0; m < 12; m++) {
      const dateIn = `${year}-${String(m + 1).padStart(2, '0')}-01`;
      const month = getMonthLetter(dateIn);
      if (!existingMonths.includes(month)) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const dateOut = `${year}-${String(m + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        monthsToCreate.push({ month, dateIn, dateOut, status: true });
      }
    }

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
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`banks/settings/banksCalendar/${currentItem.id}`, data, () => {
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
