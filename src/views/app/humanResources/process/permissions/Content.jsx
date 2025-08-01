import React, { useState, useEffect } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import ControlPanel from '@Components/controlPanel';
import moment from 'moment';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewPermission from './ModalViewPermission';
import DetailPermission from './DetailPermission';

const Permissions = ({ setLoading }) => {
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [dataPermissions, setDataPermissions] = useState([]);
  const [openModalPermission, setOpenModalPermission] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const permissionValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    date: [(val) => val !== "", "msg.required.input.date"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    applicationTypeId: [(val) => validInt(val) > 0, "msg.required.select.applicationTypeId"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== "", "msg.required.select.dateEnd"],
    reason: [(val) => val !== "", "msg.required.input.reason"],
    authorizedById: [(val) => validInt(val) > 0, "msg.required.select.authorizedBy"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    date: '',
    typeId: 0,
    applicationTypeId: 0,
    dateStart: '',
    dateEnd: '',
    phoneContact: '',
    reason: '',
    description: '',
    observations: '',
    authorizedById: 0,
    withPayment: 0,
    status: 1
  }, permissionValid);

  const { id, employeeId, date, typeId, applicationTypeId, dateStart, dateEnd, phoneContact, reason, description, observations,
    authorizedById, withPayment, status } = formState;

  const fnNewPermission = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/permissions', (resp) => {
      const permissions = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.authorizedBy = item.rrhhAuthorizer ? `${item.rrhhAuthorizer.firstName}  ${item.rrhhAuthorizer.secondName}  ${item.rrhhAuthorizer.lastName}
        ${item.rrhhAuthorizer.secondLastName}` : ""
        item.dateStart = item.dateStart.substring(0, 19);
        item.dateEnd = item.dateEnd.substring(0, 19);
        const date1 = moment(item.dateStart);
        const date2 = moment(item.dateEnd);
        const daysDiff = date2.diff(date1, 'days') + 1;
        const hoursDiff = date2.diff(date1, 'hours', true);
        if (item.typeId === 1) {
          item.time = `${daysDiff} Dias`
        } else {
          item.time = `${hoursDiff} Horas`
        }
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPermissions(permissions);
      setOpenModalPermission(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSearchPermission = () => {
    fnGetData();
  }

  const fnSavePermission = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      employeeId,
      date,
      typeId,
      applicationTypeId,
      dateStart,
      dateEnd,
      phoneContact,
      reason,
      description,
      notes: observations,
      authorizedById,
      withPayment,
      filePath,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/permissions', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/permissions/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

  }

  const fnPrintPermission = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/permissions/exportPDFPermission', dataPrint, 'Solicitud de Permiso.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeletePermission = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/permissions/${id}`, (resp) => {
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
    fnNew: fnNewPermission,
    fnSearch: fnSearchPermission,
    fnSave: fnSavePermission,
    fnPrint: fnPrintPermission,
    fnDelete: fnDeletePermission,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailPermission = {
    employeeId,
    date,
    typeId,
    applicationTypeId,
    dateStart,
    dateEnd,
    phoneContact,
    reason,
    description,
    observations,
    authorizedById,
    withPayment,
    filePath,
    status,
    listImmediateBoss,
    listEmployees,
    setFilePath,
    onInputChange,
    setBulkForm,
    formValidation,
    sendForm
  }

  const propsToModalViewPermission = {
    ModalContent: ModalViewPermission,
    title: "page.permission.modal.viewPermission.title",
    open: openModalPermission,
    setOpen: setOpenModalPermission,
    maxWidth: 'lg',
    data: {
      dataPermissions,
      setFilePath,
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
              <Separator className="mt-2 mb-5" />
              <DetailPermission {...propsToDetailPermission} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewPermission} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Permissions