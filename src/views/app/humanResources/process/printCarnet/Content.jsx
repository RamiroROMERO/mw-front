import { Button, Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { usePrintCarnet } from './usePrintCarnet';

const PrintCarnet = ({ setLoading, screenControl }) => {

  const {employeeId, onInputChange, listEmployees, sendForm, formValidation, employeesSelected, fnAddEmployee, fnDeleteEmployee, fnPrintCarnet} = usePrintCarnet({setLoading, screenControl })

  const { employeeIdValid } = formValidation;

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