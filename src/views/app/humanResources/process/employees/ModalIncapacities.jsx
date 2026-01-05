import React from 'react'
import { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatDate, IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'

const ModalIncapacities = ({ setOpen, data }) => {
  const { setLoading, employeeId } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.accidents.modal.viewAccidents.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.reason"),
        dataField: "reason",
        headerStyle: { width: "50%" }
      },
      {
        text: IntlMessages("table.column.startDisability"),
        dataField: "startDisability",
        headerStyle: { width: "15%" },
        cell: ({ row }) => {
          return (formatDate(row.original.startDisability));
        }
      },
      {
        text: IntlMessages("table.column.endDisability"),
        dataField: "endDisability",
        headerStyle: { width: "15%" },
        cell: ({ row }) => {
          return (formatDate(row.original.endDisability));
        }
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
    request.GET(`rrhh/process/incapacities?employeeId=${employeeId}`, (resp) => {
      const incapacities = resp.data.map((item) => {
        item.startDisability = item.startDisability === "0000-00-00" ? "1900-01-01" : item.startDisability
        item.endDisability = item.endDisability === "0000-00-00" ? "1900-01-01" : item.endDisability
        item.employee = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} 
        ${item.rrhhEmployee.secondLastName}`
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: incapacities
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

export default ModalIncapacities