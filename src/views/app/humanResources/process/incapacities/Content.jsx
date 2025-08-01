import React, { useState, useEffect } from 'react'
import { Card, CardBody, Row } from 'reactstrap'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { useForm } from '@Hooks'
import { validInt } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewIncapacity from './ModalViewIncapacity'
import DetailIncapacity from './DetailIncapacity'

const Incapacities = ({ setLoading }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const [dataIncapacities, setDataIncapacities] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalIncapacity, setOpenModalIncapacity] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const incapacitiesValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    reason: [(val) => val !== "", "msg.required.input.reason"],
    description: [(val) => val !== "", "msg.required.input.description"],
    startDisability: [(val) => val !== "", "msg.required.select.startDisability"],
    endDisability: [(val) => val !== "", "msg.required.select.endDisability"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    employeeId: 0,
    reason: '',
    description: '',
    employeeStatus: '',
    medicalAsistance: '',
    startDisability: '',
    endDisability: '',
    comments: ''
  }, incapacitiesValid);

  const { id, date, employeeId, reason, description, employeeStatus, medicalAsistance, startDisability, endDisability, comments } = formState;

  const fnNewIncapacity = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchIncapacity = () => {
    setLoading(true);
    request.GET('rrhh/process/incapacities', (resp) => {
      const incapacities = resp.data.map((item) => {
        item.startDisability = item.startDisability==="0000-00-00"?"1900-01-01":item.startDisability
        item.endDisability = item.endDisability==="0000-00-00"?"1900-01-01":item.endDisability
        item.employee = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} 
        ${item.rrhhEmployee.secondLastName}`
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataIncapacities(incapacities);
      setOpenModalIncapacity(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveIncapacity = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      date,
      employeeId,
      reason,
      description,
      employeeStatus,
      medicalAsistance,
      startDisability,
      endDisability,
      comments
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/incapacities', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/incapacities/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintIncapacity = () => []

  const fnDeleteIncapacity = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/incapacities/${id}`, (resp) => {
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
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewIncapacity,
    fnSearch: fnSearchIncapacity,
    fnSave: fnSaveIncapacity,
    fnPrint: fnPrintIncapacity,
    fnDelete: fnDeleteIncapacity,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailIncapacity = {
    date,
    employeeId,
    reason,
    description,
    employeeStatus,
    medicalAsistance,
    startDisability,
    endDisability,
    comments,
    listEmployees,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToModalIncapacity = {
    ModalContent: ModalViewIncapacity,
    title: "page.incapacities.modal.viewIncapacity.title",
    open: openModalIncapacity,
    setOpen: setOpenModalIncapacity,
    maxWidth: 'lg',
    data: {
      dataIncapacities,
      setBulkForm
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
              <Separator className="mt-2 mb-4" />
              <DetailIncapacity {...propsToDetailIncapacity} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalIncapacity} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Incapacities