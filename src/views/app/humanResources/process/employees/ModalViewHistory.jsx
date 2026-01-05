/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatDate, IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'
import DateCalendar from '@Components/dateCalendar'
import { InputField } from '@Components/inputFields'

const ModalViewHistory = ({ setOpen, data }) => {
  const { employeeId, employeeName, dateIn, setLoading } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.viewHistory.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.dateDeparture"),
        dataField: "date",
        headerStyle: { width: "15%" },
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.comment"),
        dataField: "reason",
        headerStyle: { width: "55%" }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.column.status"),
        dataField: "statusName",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.column.isHireable"),
        dataField: "hireable",
        headerStyle: { width: "15%" }
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
    request.GET(`rrhh/process/employeeHistory?employeeId=${employeeId}`, (resp) => {
      const history = resp.data.map((item) => {
        item.hireable = item.isHireable === true ? 'Si' : 'No'
        item.statusName = item.status === true ? 'Activo' : 'Inactivo'
        return item;
      });
      const tableData = {
        ...table, data: history
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
          <Colxx xxs={12} md={8}>
            <InputField
              name='employeeName'
              label='select.employee'
              value={employeeName}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} md={4}>
            <DateCalendar
              name="date"
              value={dateIn}
              label='select.dateIn'
              disabled
            />
          </Colxx>
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

export default ModalViewHistory