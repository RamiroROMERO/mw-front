import React, { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import DetailProject from './DetailProject'
import DetailTable from './DetailTable'

const Projects = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [dataProjects, setDataProjects] = useState([]);
  const [listProjects, setListProjects] = useState([]);

  const projectsValid = {
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val.length > 5, "msg.required.input.name"],
    initDate: [(val) => val !== "", "msg.required.select.dateStart"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    customerId: 0,
    code: '',
    name: '',
    description: '',
    initDate: '',
    markAssistance: 0,
    status: 1
  }, projectsValid);

  const { id, customerId, code, name, description, initDate, markAssistance, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projects = resp.data.map((item) => {
        item.customer = item.facCliente ? item.facCliente.nomcli : ''
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataProjects(projects);

      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id,
          customerId: item.customerId,
          code: item.code,
          corre: item.corre
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToDetailProject = {
    id,
    customerId,
    code,
    name,
    description,
    initDate,
    markAssistance,
    status,
    listCustomers,
    fnGetData,
    onInputChange,
    onResetForm,
    setLoading,
    formValidation,
    isFormValid
  }

  const propsToDetailTable = {
    id,
    dataProjects,
    listProjects,
    listCustomers,
    fnGetData,
    onResetForm,
    setBulkForm,
    setLoading
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" xl="5">
          <DetailProject {...propsToDetailProject} />
        </Colxx>
        <Colxx xxs="12" xl="7">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default Projects