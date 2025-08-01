import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useForm } from '@Hooks';
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import createNotification from '@Containers/ui/Notifications';

const PrintCarnet = ({ setLoading }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const [employeesSelected, setEmployeesSelected] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const carnetValidations = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    employeeId: 0
  }, carnetValidations);

  const { employeeId } = formState;

  const { employeeIdValid } = formValidation;

  const fnAddEmployee = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const filterEmployee = listEmployees.filter((item) => {
      return item.value === employeeId
    });

    const filterEmplSelected = employeesSelected.filter((item2) => {
      return item2.id === employeeId;
    });

    if (filterEmplSelected.length > 0) {
      createNotification('warning', 'msg.employeeRepeat', 'alert.warning.title');
      return;
    }

    const newData = {
      id: employeeId,
      name: filterEmployee[0].label,
      dni: filterEmployee[0].dni
    }

    setEmployeesSelected(current => [...current, newData]);
    onResetForm();
    setSendForm(false);
  }

  const fnDeleteEmployee = (item2) => {
    const newData = employeesSelected.filter((item) => {
      return item.id !== item2.id;
    });
    setEmployeesSelected(newData);
  }

  const fnPrintCarnet = () => {
    if (employeesSelected.length === 0) {
      createNotification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    request.GETPdf('rrhh/process/employees/exportPDFCarnet', { employeesId: employeesSelected }, 'Carnet de Empleado.pdf', (err) => {
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
          dni: item.dni
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="5">
          <Card className="mb-3">
            <CardBody>
              <Row>
                <Colxx xxs="12">
                  <SearchSelect
                    label='select.employee'
                    name='employeeId'
                    inputValue={employeeId}
                    options={listEmployees}
                    onChange={onInputChange}
                    invalid={sendForm && !!employeeIdValid}
                    feedbackText={sendForm && (employeeIdValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" align="right">
                  <Button color="primary" onClick={fnAddEmployee}>
                    <i className="bi bi-person-plus" /> {IntlMessages("button.add")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="7">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12">
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th width="20%">{IntlMessages("table.column.dni")}</th>
                        <th width="65%">{IntlMessages("table.column.name")}</th>
                        <th width="15%">{IntlMessages("table.column.options")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesSelected.map((item, idx) => {
                        return (
                          <tr id={`tr-table-employees-${item.id}`} key={idx}>
                            <td width="20%">{item.dni}</td>
                            <td width="65%">{item.name}</td>
                            <td align='right' width="15%">
                              <Button type="button" className="btn-circle-table" color="danger"
                                onClick={() => { fnDeleteEmployee(item) }} key={`buttons-${idx}`}>
                                <i className='bi bi-trash' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" align="right">
                  <Button color="primary" onClick={fnPrintCarnet}>
                    <i className="iconsminds-printer" /> {IntlMessages("button.print")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  )
}

export default PrintCarnet