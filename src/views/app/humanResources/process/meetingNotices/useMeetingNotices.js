import { API_URLS } from '@/helpers/APIUrl';
import { request } from '@/helpers/core';
import { getCurrentDate, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import ViewPdf from '@/components/ViewPDF/ViewPdf';

export const useMeetingNotices = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [dataMeetings, setDataMeetings] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  // imprimir pdf
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const documentValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    date: getCurrentDate(),
    employeeId: 0
  }, documentValid);

  const { id, date, employeeId } = formState;

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
    request.GET(`${API_URLS.RRHH_PROC_MEETING_NOTICES}`, (resp) => {
      const data = resp.data.map((item) => {
        item.employee = `${item.employeeData.firstName} ${item.employeeData.secondName} ${item.employeeData.lastName}
        ${item.employeeData.secondLastName}`
        item.dateMeet = item.date.toString().slice(0, 10)
        item.date = item.date.substring(0, 19);
        item.statusIcon = item.status === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataMeetings(data);
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
      request.POST(`${API_URLS.RRHH_PROC_MEETING_NOTICES}`, formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnPrintPdf({id});
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
      request.PUT(`${API_URLS.RRHH_PROC_MEETING_NOTICES}/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnPrintPdf({id});
        fnClear();
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnPrintPdf = (item) => {
    const dataPrint = {
      id: item.id,
    }

    request.GETPdfUrl(`${API_URLS.RRHH_PROC_MEETING_NOTICES}/exportPDF`, dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnConfirmDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`${API_URLS.RRHH_PROC_MEETING_NOTICES}/${id}`, (resp) => {
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

  const propsToDetailMeeting = {
    date,
    employeeId,
    listEmployees,
    onInputChange,
    formValidation,
    sendForm,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    dataMeetings,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete,
    fnPrintPdf
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDelete,
    fnOnNo: onResetForm,
    title: "alert.question.title"
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.quote",
    // valueTitle: quoteId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    {
      propsToMsgDelete,
      propsToDetailMeeting,
      propsToDetailTable,
      propsToViewPDF
    }
  )
}
