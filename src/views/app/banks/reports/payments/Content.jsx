import { Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import { usePayments } from './usePayments';

const Payments = ({ setLoading }) => {
  const { table, propsToHeaderReport, selectedRow, appliedDocuments } = usePayments({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      {selectedRow && (
        <Row>
          <Colxx xxs="12">
            <Card>
              <CardBody>
                <strong>{IntlMessages('page.checkRequest.title.detailRequest')}:</strong> {selectedRow.providerName} — {formatNumber(selectedRow.value)}
                <Table bordered hover responsive size="sm" className="mt-2">
                  <thead>
                    <tr>
                      <th>{IntlMessages('table.column.nInvoice')}</th>
                      <th>{IntlMessages('table.column.beneficiary')}</th>
                      <th align="right">{IntlMessages('table.column.value')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedDocuments.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.documentCode}</td>
                        <td>{doc.providerName}</td>
                        <td align="right">{formatNumber(doc.value)}</td>
                      </tr>
                    ))}
                    {appliedDocuments.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-muted">—</td></tr>
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      )}
    </>
  );
}
export default Payments;
