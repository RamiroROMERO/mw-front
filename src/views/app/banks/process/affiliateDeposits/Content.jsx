import { Card, CardBody, Row, Button, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useAffiliateDeposits } from './useAffiliateDeposits';

const AffiliateDeposits = ({ setLoading }) => {
  const { dataList, fnView, selectedHeader, selectedLines, fnClose, fnAskDelete, propsToMsgDelete } = useAffiliateDeposits({ setLoading });

  const table = {
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.bankConciliation.input.periodName'), dataField: 'internalCode', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.transferAffiliates.select.affiliate'), dataField: 'affiliateName', headerStyle: { width: '30%' } },
      { text: IntlMessages('select.bankCode'), dataField: 'bankName', headerStyle: { width: '25%' } },
      { text: IntlMessages('table.column.value'), dataField: 'value', headerStyle: { width: '15%' } }
    ],
    data: dataList,
    actions: [{
      color: 'warning',
      icon: 'eye',
      toolTip: 'button.view',
      onClick: fnView
    }]
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ReactTable {...table} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {selectedHeader && (
        <Row className="mt-3">
          <Colxx xxs="12">
            <Card>
              <CardBody>
                <Row>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('table.column.date')}:</strong> {DateHelper.format(selectedHeader.date)}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('page.transferAffiliates.select.affiliate')}:</strong> {selectedHeader.affiliateName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('select.bankCode')}:</strong> {selectedHeader.bankName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('table.column.value')}:</strong> {formatNumber(selectedHeader.value)}</Colxx>
                </Row>
                <Row className="mt-2">
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('input.document')}:</strong> {selectedHeader.documentName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{IntlMessages('table.column.reference')}:</strong> {selectedHeader.reference}</Colxx>
                  <Colxx xxs="12" sm="6" lg="6"><strong>{IntlMessages('page.variousDeposits.input.description')}:</strong> {selectedHeader.concept}</Colxx>
                </Row>
                <Separator className="mt-3 mb-3" />
                <Table bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>{IntlMessages('select.accountType')}</th>
                      <th>{IntlMessages('page.variousDeposits.input.description')}</th>
                      <th align="right">{IntlMessages('page.checks.input.valueDebe')}</th>
                      <th align="right">{IntlMessages('page.checks.input.valueHaber')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLines.map((line) => (
                      <tr key={line.codigo}>
                        <td>{line.accountNumber} - {line.accountName}</td>
                        <td>{line.description}</td>
                        <td align="right">{formatNumber(line.valueDebit)}</td>
                        <td align="right">{formatNumber(line.valueCredit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Row className="div-action-button-container">
                  <Colxx xxs="12">
                    <Button color="danger" onClick={fnAskDelete}>
                      <i className="bi bi-x-circle" /> {IntlMessages('page.affiliateDeposits.button.void')}
                    </Button>
                    <Button color="secondary" onClick={fnClose}>
                      <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
                    </Button>
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      )}
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default AffiliateDeposits;
