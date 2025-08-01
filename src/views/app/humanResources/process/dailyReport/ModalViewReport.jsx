import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import { request } from '@Helpers/core'
import DateCalendar from '@Components/dateCalendar'
import ReactTable from '@Components/reactTable'

const ModalViewReport = ({data, setOpen}) => {
  const {date, dataDailyReport, setEmployeesDetail, setBulkForm, setLoading, listProjects, setFilterProjects} = data;

  const fnViewReport = (itemRep)=>{
    const filter = listProjects.filter((item)=>{
      return item.customerId === itemRep.customerId
    });
    setFilterProjects(filter);
    setLoading(true);
    request.GET(`rrhh/process/dailyReportDetail?fatherId=${itemRep.id}`, (resp)=>{
      const reportDetail = resp.data.map((item)=>{
        return {
          id: item.id,
          date: item.date,
          employeeId: item.employeeId,
          name: item.rrhhEmployee?`${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName}
          ${item.rrhhEmployee.secondLastName}`:""
        }
      });
      setEmployeesDetail(reportDetail);
      setBulkForm(itemRep);
      setOpen(false);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.dailyReport.modal.viewReport.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customer",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("table.column.project"),
        dataField: "project",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("page.employees.select.workSchedule"),
        dataField: "turnName",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataDailyReport,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewReport,
      }
    ]
  });

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" md="6">
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            disabled
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalViewReport