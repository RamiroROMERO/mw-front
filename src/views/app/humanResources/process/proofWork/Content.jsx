import React, { useState, useEffect } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewProofWork from './ModalViewProofWork'
import DetailProofWork from './DetailProofWork'

const ProofWork = ({ setLoading }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [dataProofWork, setDataProofWork] = useState([]);
  const [openModalViewProofWork, setOpenModalViewProofWork] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const proofWorkValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    creationDate: [(val) => val !== "", "msg.required.input.date"],
    authorizedSignature: [(val) => validInt(val) > 0, "msg.required.select.authorizedSignature"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    typeId: 0,
    creationDate: '',
    contractEndDate: '',
    addressee: '',
    authorizedSignature: 0,
    antiquity: 0,
    salary: 0,
    deductions: 0,
    amount: 0,
    description: '',
    status: 1
  }, proofWorkValid);

  const { id, employeeId, typeId, creationDate, contractEndDate, addressee, authorizedSignature, antiquity, salary, deductions,
    amount, description, status } = formState;

  const fnNewProofWork = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchProofWork = () => {
    setLoading(true);
    request.GET('rrhh/process/proofWork', (resp) => {
      const proofWork = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.dni = item.rrhhEmployee ? `${item.rrhhEmployee.dni}` : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataProofWork(proofWork);
      setOpenModalViewProofWork(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveProofWork = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      employeeId,
      typeId,
      creationDate,
      contractEndDate: contractEndDate === "" ? "1900-01-01" : contractEndDate,
      addressee,
      authorizedSignature,
      antiquity,
      salary,
      deductions,
      amount,
      description,
      filePath,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/proofWork', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/proofWork/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintProofWork = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/proofWork/exportPDFProofWork', dataPrint, 'Constancia de Trabajo.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteProofWork = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/proofWork/${id}`, (resp) => {
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
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewProofWork,
    fnSearch: fnSearchProofWork,
    fnSave: fnSaveProofWork,
    fnPrint: fnPrintProofWork,
    fnDelete: fnDeleteProofWork,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailProofWork = {
    employeeId,
    typeId,
    creationDate,
    contractEndDate,
    addressee,
    authorizedSignature,
    antiquity,
    salary,
    deductions,
    amount,
    description,
    filePath,
    setFilePath,
    status,
    listEmployees,
    listImmediateBoss,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToModalViewProofWork = {
    ModalContent: ModalViewProofWork,
    title: "page.proofWork.modal.viewProofWork.title",
    open: openModalViewProofWork,
    setOpen: setOpenModalViewProofWork,
    maxWidth: 'lg',
    data: {
      dataProofWork,
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
              <DetailProofWork {...propsToDetailProofWork} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProofWork} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ProofWork