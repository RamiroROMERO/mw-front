import React, { useState, useEffect } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import createNotification from '@Containers/ui/Notifications';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewAccidents from './ModalViewAccidents'
import DetailAccident from './DetailAccident'

const Accidents = ({ setLoading }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const [dataAccidents, setDataAccidents] = useState([]);
  const [openModalAccidents, setOpenModalAccidents] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [showInputs, setShowInputs] = useState("none");
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const accidentValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateAccident: [(val) => val !== "", "msg.required.select.dateAccident"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    typeId: 0,
    date: '',
    dateAccident: '',
    site: '',
    stroke: 0,
    fall: 0,
    injury: 0,
    other: 0,
    otherObs: '',
    description: '',
    medicalAsistance: '',
    employeeStatus: '',
    startDisability: '',
    endDisability: '',
    coments: '',
    affectedHead: 0,
    affectedFace: 0,
    affectedBody: 0,
    affectedHands: 0,
    affectedArms: 0,
    affectedBack: 0,
    affectedLags: 0,
    affectedFeet: 0,
    affectedOtherParts: 0,
    otherPartsObs: '',
    question1: '',
    question2: 0,
    question3: 0,
    question4: '',
    status: 1
  }, accidentValid);

  const { id, employeeId, typeId, date, dateAccident, site, stroke, fall, injury, other, otherObs, description, medicalAsistance,
    employeeStatus, startDisability, endDisability, coments, affectedHead, affectedFace, affectedBody, affectedHands, affectedArms,
    affectedBack, affectedLags, affectedFeet, affectedOtherParts, otherPartsObs, question1, question2, question3, question4, status } = formState;

  const fnNewAccident = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchAccident = () => {
    setLoading(true);
    request.GET('rrhh/process/accidents', (resp) => {
      const accidents = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.type = item.typeId === 1 ? "Accidente Común" : item.typeId === 2 ? "Accidente Laboral" : "Incapacidad"
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataAccidents(accidents);
      setOpenModalAccidents(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveAccident = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (stroke === 0 && fall === 0 && injury === 0 && other === 0) {
      createNotification('warning', 'msg.required.select.natureAccident', 'alert.warning.title');
      return;
    }
    if (validInt(typeId) === 3) {
      if (startDisability === "") {
        createNotification('warning', 'msg.required.select.startDisability', 'alert.warning.title');
        return;
      }
      if (endDisability === "") {
        createNotification('warning', 'msg.required.select.endDisability', 'alert.warning.title');
        return;
      }
    }
    if (affectedHead === 0 && affectedFace === 0 && affectedBody === 0 && affectedHands === 0 && affectedArms === 0 && affectedBack === 0 &&
      affectedLags === 0 && affectedFeet === 0 && affectedOtherParts === 0) {
      createNotification('warning', 'msg.required.select.affectedPart', 'alert.warning.title');
      return;
    }

    const newData = {
      employeeId,
      typeId,
      date,
      dateAccident,
      site,
      stroke,
      injury,
      fall,
      other,
      otherObs,
      description,
      medicalAsistance,
      employeeStatus,
      startDisability: startDisability === "" ? "1900-01-01" : startDisability,
      endDisability: endDisability === "" ? "1900-01-01" : endDisability,
      coments,
      affectedHead,
      affectedFace,
      affectedBody,
      affectedHands,
      affectedArms,
      affectedBack,
      affectedLags,
      affectedFeet,
      affectedOtherParts,
      otherPartsObs,
      question1,
      question2,
      question3,
      question4,
      filePath,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/accidents', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/accidents/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintAccident = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/accidents/exportPDFAccident', dataPrint, 'Reporte de Accidente e Incapacidad.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteAccident = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/accidents/${id}`, (resp) => {
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
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewAccident,
    fnSearch: fnSearchAccident,
    fnSave: fnSaveAccident,
    fnPrint: fnPrintAccident,
    fnDelete: fnDeleteAccident,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailAccident = {
    employeeId,
    typeId,
    date,
    dateAccident,
    site,
    stroke,
    fall,
    injury,
    other,
    otherObs,
    description,
    medicalAsistance,
    employeeStatus,
    startDisability,
    endDisability,
    coments,
    affectedHead,
    affectedFace,
    affectedBody,
    affectedHands,
    affectedArms,
    affectedBack,
    affectedLags,
    affectedFeet,
    affectedOtherParts,
    otherPartsObs,
    question1,
    question2,
    question3,
    question4,
    filePath,
    status,
    setFilePath,
    listEmployees,
    onInputChange,
    setBulkForm,
    showInputs,
    setShowInputs,
    formValidation,
    sendForm,
  }

  const propsToModalAccidents = {
    ModalContent: ModalViewAccidents,
    title: "page.accidents.modal.viewAccidents.title",
    open: openModalAccidents,
    setOpen: setOpenModalAccidents,
    maxWidth: 'lg',
    data: {
      dataAccidents,
      setFilePath,
      setBulkForm,
      setShowInputs
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
              <DetailAccident {...propsToDetailAccident} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAccidents} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Accidents