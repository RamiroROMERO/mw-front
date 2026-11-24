import { Card, CardBody, Row, Button, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useAffiliateDeposits } from './useAffiliateDeposits';

const AffiliateDeposits = ({ setLoading }) => {
  // Un solo useIntl arriba: el detalle del depósito se pinta dentro de una condición y un hook no puede llamarse así.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { dataList, fnView, selectedHeader, selectedLines, fnClose, fnAskDelete, propsToMsgDelete } = useAffiliateDeposits({ setLoading });

  const table = {
    columns: [
      { text: t('table.column.date'), dataField: 'date', headerStyle: { width: '15%' } },
      { text: t('page.bankConciliation.input.periodName'), dataField: 'internalCode', headerStyle: { width: '15%' } },
      { text: t('page.transferAffiliates.select.affiliate'), dataField: 'affiliateName', headerStyle: { width: '30%' } },
      { text: t('select.bankCode'), dataField: 'bankName', headerStyle: { width: '25%' } },
      { text: t('table.column.value'), dataField: 'value', headerStyle: { width: '15%' } }
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
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('table.column.date')}:</strong> {DateHelper.format(selectedHeader.date)}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('page.transferAffiliates.select.affiliate')}:</strong> {selectedHeader.affiliateName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('select.bankCode')}:</strong> {selectedHeader.bankName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('table.column.value')}:</strong> {formatNumber(selectedHeader.value)}</Colxx>
                </Row>
                <Row className="mt-2">
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('input.document')}:</strong> {selectedHeader.documentName}</Colxx>
                  <Colxx xxs="12" sm="6" lg="3"><strong>{t('table.column.reference')}:</strong> {selectedHeader.reference}</Colxx>
                  <Colxx xxs="12" sm="6" lg="6"><strong>{t('page.variousDeposits.input.description')}:</strong> {selectedHeader.concept}</Colxx>
                </Row>
                <Separator className="mt-3 mb-3" />
                <Table bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>{t('select.accountType')}</th>
                      <th>{t('page.variousDeposits.input.description')}</th>
                      <th align="right">{t('page.checks.input.valueDebe')}</th>
                      <th align="right">{t('page.checks.input.valueHaber')}</th>
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
                      <i className="bi bi-x-circle" /> {t('page.affiliateDeposits.button.void')}
                    </Button>
                    <Button color="secondary" onClick={fnClose}>
                      <i className="bi bi-box-arrow-right" /> {t('button.exit')}
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
