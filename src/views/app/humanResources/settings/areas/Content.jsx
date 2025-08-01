import React, { useEffect, useState } from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailAreas from './DetailAreas';
import DetailTable from './DetailTable';

const Areas = (props) => {
  const { setLoading } = props;
  const [listBossId, setListBossId] = useState([]);
  const [listAccount, setListAccount] = useState([]);
  const [dataAreas, setDataAreas] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [currentItem, setCurrentItem] = useState({});

  const { formState, setBulkForm, onInputChange, onResetForm } = useForm({
    id: 0,
    name: '',
    bossId: 0,
    idCtaRrhhSeverance: '',
    idCtaRrhhNotice: '',
    idCtaRrhhVacation: '',
    idCtaRrhhThirteenth: '',
    idCtaRrhhFourteenth: '',
    status: true
  })

  const { id, name, bossId, idCtaRrhhSeverance, idCtaRrhhNotice, idCtaRrhhVacation, idCtaRrhhThirteenth, idCtaRrhhFourteenth, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET(`admin/areas?useRrhh=1`, (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataAreas(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    if (name === "") {
      notification('warning', 'msg.required.input.name', 'alert.warning.title');
      return;
    }
    if (bossId === "") {
      notification('warning', 'msg.required.input.bossId', 'alert.warning.title');
      return;
    }
    if (idCtaRrhhSeverance === "") {
      notification('warning', 'msg.required.select.typeAccount', 'alert.warning.title');
      return;
    }
    const data = {
      id,
      name,
      bossId,
      idCtaRrhhSeverance,
      idCtaRrhhNotice,
      idCtaRrhhVacation,
      idCtaRrhhThirteenth,
      idCtaRrhhFourteenth,
      useRrhh: 1,
      status
    }
    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/areas/${id}`, data, (resp) => {
        console.log(resp);
        fnGetData();
        onResetForm();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/areas', data, (resp) => {
        console.log(resp);
        fnGetData();
        onResetForm();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`admin/areas/${currentItem.id}`, (resp) => {
      console.log(resp);
      fnGetData();
      onResetForm();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToDetailAreas = {
    ...formState,
    fnSave,
    onResetForm,
    listBossId,
    listAccount,
    onInputChange,
    setBulkForm
  }

  const propsToDetailTable = {
    dataAreas,
    setBulkForm,
    setCurrentItem,
    setOpenMsgQuestion,
    fnSave
  }

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccount(account);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?areaManager=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
        }
      });
      setListBossId(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4">
          <DetailAreas {...propsToDetailAreas} />
        </Colxx>
        <Colxx xss="12" lg="8">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Areas;