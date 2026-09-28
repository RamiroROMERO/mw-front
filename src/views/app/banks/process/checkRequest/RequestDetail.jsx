import { Row, Button, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages, validFloat, formatNumber } from '@Helpers/Utils';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import DateHelper from '@Helpers/DateHelper';

// Tabla cruda (no ReactTable/ReactTableEdit, ver feedback_reacttableedit_no_actions_no_cell)
// porque cada fila tiene un input editable (valor a solicitar) y un botón de eliminar.
export const RequestDetail = ({ lines, fnUpdateLine, fnRemoveLine, fnOpenCxpPicker, formStateIndex, onInputChangeIndex }) => {
  const { extraChargeDescription1, extraChargeValue1, extraChargeDescription2, extraChargeValue2 } = formStateIndex;

  const totalLines = lines.reduce((sum, l) => sum + (validFloat(l.paymentValue) || 0), 0);
  const total = totalLines + (validFloat(extraChargeValue1) || 0) + (validFloat(extraChargeValue2) || 0);

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.checkRequest.title.detailRequest">
          <Row className="mb-2">
            <Colxx xxs="12" align="right">
              <Button color="primary" size="sm" onClick={fnOpenCxpPicker}>
                <i className="bi bi-plus" /> {IntlMessages('button.addInvoice')}
              </Button>
            </Colxx>
          </Row>
          <Row className="mb-3">
            <Colxx xxs="12">
              <Table bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>{IntlMessages('table.column.date')}</th>
                    <th>{IntlMessages('table.column.provider')}</th>
                    <th>{IntlMessages('table.column.nInvoice')}</th>
                    <th>{IntlMessages('page.customerDeposits.table.originalValue')}</th>
                    <th>{IntlMessages('page.checkRequest.table.paymentValue')}</th>
                    <th>{IntlMessages('table.column.options')}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td>{DateHelper.format(line.invoiceDate)}</td>
                      <td>{line.providerName}</td>
                      <td>{line.documentCode}</td>
                      <td>{formatNumber(line.invoiceValue)}</td>
                      <td style={{ minWidth: 110 }}>
                        <InputField
                          name="paymentValue"
                          value={line.paymentValue}
                          onChange={(e) => fnUpdateLine(index, 'paymentValue', e.target.value)}
                          type="text"
                        />
                      </td>
                      <td>
                        <Button color="danger" size="sm" onClick={() => fnRemoveLine(index)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12" sm="8" md="9">
              <InputField
                name="extraChargeDescription1"
                value={extraChargeDescription1}
                onChange={onInputChangeIndex}
                label="page.checkRequest.input.extraCharge"
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" sm="4" md="3">
              <InputField
                name="extraChargeValue1"
                value={extraChargeValue1}
                onChange={onInputChangeIndex}
                label="page.checkRequest.input.extraChargeValue"
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" sm="8" md="9">
              <InputField
                name="extraChargeDescription2"
                value={extraChargeDescription2}
                onChange={onInputChangeIndex}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" sm="4" md="3">
              <InputField
                name="extraChargeValue2"
                value={extraChargeValue2}
                onChange={onInputChangeIndex}
                type="text"
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12" sm="4" className="ms-auto">
              <InputField name="total" value={formatNumber(total)} label="page.checkRequest.input.totalDetail" type="text" bold disabled />
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  );
}
