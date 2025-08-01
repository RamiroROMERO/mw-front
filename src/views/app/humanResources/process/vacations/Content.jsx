import React, { useState, useEffect } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewVacations from './ModalViewVacations'
import DetailVacation from './DetailVacation'

const Vacations = ({ setLoading }) => {
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [dataVacations, setdataVacations] = useState([]);
  const [openModalVacations, setOpenModalVacations] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const vacationsValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== "", "msg.required.select.dateEnd"],
    authorizedById: [(val) => validInt(val) > 0, "msg.required.select.authorizedBy"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    date: '',
    dateStart: '',
    dateEnd: '',
    description: '',
    notes: '',
    phoneContact: '',
    authorizedById: '',
    incSunday: 0,
    paidVacation: 0,
    status: 1
  }, vacationsValid);

  const { id, employeeId, date, dateStart, dateEnd, description, notes, phoneContact, authorizedById, incSunday, paidVacation, status } = formState;

  const fnNewVacation = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchVacation = () => {
    setLoading(true);
    request.GET('rrhh/process/vacations', (resp) => {
      const vacations = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.authorizedBy = item.rrhhAuthorized ? `${item.rrhhAuthorized.firstName}  ${item.rrhhAuthorized.secondName}  ${item.rrhhAuthorized.lastName}
        ${item.rrhhAuthorized.secondLastName}` : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setdataVacations(vacations);
      setOpenModalVacations(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveVacation = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      employeeId,
      date,
      dateStart,
      dateEnd,
      description,
      notes,
      phoneContact,
      authorizedById,
      filePath,
      incSunday,
      paidVacation,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/vacations', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/vacations/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintVacation = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/vacations/exportPDFVacation', dataPrint, 'Solicitud de Vacaciones.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteVacation = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/vacations/${id}`, (resp) => {
      console.log(resp);
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          areaManager: item.areaManager
        }
      });
      const filterManagers = employees.filter((item) => {
        return item.areaManager === 1
      });
      setListEmployees(employees);
      setListImmediateBoss(filterManagers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  const propsToControlPanel = {
    fnNew: fnNewVacation,
    fnSearch: fnSearchVacation,
    fnSave: fnSaveVacation,
    fnPrint: fnPrintVacation,
    fnDelete: fnDeleteVacation,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailVacation = {
    employeeId,
    date,
    dateStart,
    dateEnd,
    description,
    notes,
    phoneContact,
    authorizedById,
    filePath,
    setFilePath,
    incSunday,
    paidVacation,
    status,
    listImmediateBoss,
    listEmployees,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToModalViewVacations = {
    ModalContent: ModalViewVacations,
    title: "page.vacations.modal.viewVacation.title",
    open: openModalVacations,
    setOpen: setOpenModalVacations,
    maxWidth: 'lg',
    data: {
      dataVacations,
      setBulkForm,
      setFilePath
    }
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <DetailVacation {...propsToDetailVacation} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewVacations} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Vacations