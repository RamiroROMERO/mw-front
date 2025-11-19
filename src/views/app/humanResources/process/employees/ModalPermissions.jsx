import React from 'react'
import { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatDate, IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'
import moment from 'moment';

const ModalPermissions = ({setOpen, data}) => {
  const {setLoading, employeeId} = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.permissions.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.permission.modal.table.column.time"),
        dataField: "time",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.permission.modal.table.column.authorizedBy"),
        dataField: "authorizedBy",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: []
  });

  const fnGetData = ()=>{
    setLoading(true);
    request.GET(`rrhh/process/permissions?employeeId=${employeeId}`, (resp) => {
      const permissions = resp.data.map((item) => {
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
      const tableData = {
        ...table, data: permissions
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    fnGetData();
  },[]);

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalPermissions