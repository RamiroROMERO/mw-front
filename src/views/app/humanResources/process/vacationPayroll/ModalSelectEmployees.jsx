import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { IntlMessages, validFloat, validInt } from '@Helpers/Utils';
import { ReactTableEdit } from '@Components/reactTableEdit';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

const ModalSelectEmployees = ({ setOpen, data }) => {
  const { typeId, date, customerId, projectId, dateStart, dateEnd, notes, status, userId, listEmployeesByProject, setListEmployeesByProject, onInputChange, setLoading, setSendForm, fnViewDetailPayroll } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.employees.title"),
    columns: [
      {
        label: "select.employee",
        field: "employeeName",
        headerStyle: { textAlign: 'left', width: '80%' },
        bodyStyle: { width: '80%' }
      },
      {
        label: "table.column.daysPending",
        field: "daysPending",
        headerStyle: { textAlign: 'center', width: "20%" },
        bodyStyle: { width: '20%' }
      },
      {
        label: "table.column.daysToPay",
        field: "daysToPay",
        headerStyle: { textAlign: 'center', width: "20%" },
        bodyStyle: { width: '20%' },
        isEditable: true
      },
    ],
    data: listEmployeesByProject,
    onChangeData: setListEmployeesByProject,
    options: {
      columnActions: "options",
      tableHeight: '300px'
    }
  });

  const fnGeneratePayroll = () => {
    const filterEmployees = listEmployeesByProject.filter(item => validFloat(item.daysToPay) > 0);

    if (filterEmployees.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const newData = {
      typeId,
      date,
      customerId,
      projectId,
      dateStart,
      dateEnd,
      notes,
      status,
      userId,
      dataEmployees: filterEmployees
    }

    if (filterEmployees.length > 0) {
      request.POST('rrhh/process/weeklyPayrolls/generateVacationPayroll', newData, (resp) => {
        if (validInt(resp.data.id) > 0) {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
        }
        fnViewDetailPayroll(resp.data.id);
        setSendForm(false);
        setLoading(false);
        setOpen(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
        <Button color="primary" onClick={fnGeneratePayroll}>
          <i className="bi bi-cash-coin" /> {IntlMessages("button.generatePayroll")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSelectEmployees