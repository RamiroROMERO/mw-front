import React from 'react'
import { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatDate, IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'

const ModalVacations = ({ setOpen, data }) => {
  const { setLoading, employeeId } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.vacations.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "15%" },
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("page.permission.modal.table.column.time"),
        dataField: "time",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("page.permission.modal.table.column.authorizedBy"),
        dataField: "authorizedBy",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: { width: "10%" }
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: []
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/vacations?employeeId=${employeeId}`, (resp) => {
      const vacations = resp.data.map((item) => {
        item.authorizedBy = item.rrhhAuthorized ? `${item.rrhhAuthorized.firstName}  ${item.rrhhAuthorized.secondName}  ${item.rrhhAuthorized.lastName}
        ${item.rrhhAuthorized.secondLastName}` : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: vacations
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalVacations