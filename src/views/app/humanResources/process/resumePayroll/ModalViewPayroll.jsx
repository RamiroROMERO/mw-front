import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable'

const ModalViewPayroll = ({setOpen, data}) => {
  const {customerName, projectName, dataPayrolls, onBulkForm, fnViewDetailPayroll, listProjects, setListProjectsFilter} = data;

  const fnViewDetail = (item)=>{
    const filter = listProjects.filter((item2)=>{
      return item2.customerId === item.customerId
    });

    setListProjectsFilter(filter);
    fnViewDetailPayroll(item.id);
    onBulkForm(item);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.modal.viewPayrolls.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "dateVal",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "startDate",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.dateEnd"),
        dataField: "endDate",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.notes"),
        dataField: "notes",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataPayrolls,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewDetail
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" sm="12" lg="9">
            <InputField
              label='select.customer'
              name='customerName'
              value={customerName}
              disabled
            />
          </Colxx>
          <Colxx xxs="12" sm="12" lg="3">
            <InputField
              label='page.dailyReport.select.projectId'
              name='projectName'
              value={projectName}
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
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalViewPayroll