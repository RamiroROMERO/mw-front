import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useOtherReceivableReports } from './useOtherReceivableReports';

// Tabla plana (no ReactTable): el estado de cuenta lleva un subtotal después de los documentos de cada cliente y un total general; el orden de las filas es parte del documento.
const OtherReceivableReports = ({ setLoading }) => {
  const { propsToHeader, rows, totals, counts, formatNumber, formatDate, statusText, t } = useOtherReceivableReports({ setLoading });
  const num = (value) => formatNumber(value);
  const columns = ['customer', 'document', 'date', 'originalValue', 'payments', 'creditNotes', 'debitNotes', 'balance', 'dueDate', 'status'];

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeader} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="4" lg="2"><Card className="mb-3"><CardBody><p className="text-muted mb-1">{t('page.otherReceivableReports.summary.customers')}</p><h6>{counts.customers}</h6></CardBody></Card></Colxx>
        <Colxx xxs="12" md="4" lg="2"><Card className="mb-3"><CardBody><p className="text-muted mb-1">{t('page.otherReceivableReports.summary.documents')}</p><h6>{counts.documents}</h6></CardBody></Card></Colxx>
        <Colxx xxs="12" md="4" lg="3"><Card className="mb-3"><CardBody><p className="text-muted mb-1">{t('page.otherReceivableReports.table.balance')}</p><h6>{num(totals.balance)}</h6></CardBody></Card></Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>{columns.map((c) => <th key={c}>{t(`page.otherReceivableReports.table.${c}`)}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (r.kind === 'subtotal' ? (
                    <tr key={`s-${r.customerId}-${i}`} className="fw-bold">
                      <td colSpan={3}>{`${t('page.otherReceivableReports.table.total')} ${r.customerName}`}</td>
                      <td className="text-end">{num(r.originalValue)}</td>
                      <td className="text-end">{num(r.payments)}</td>
                      <td className="text-end">{num(r.creditNotes)}</td>
                      <td className="text-end">{num(r.debitNotes)}</td>
                      <td className="text-end">{num(r.balance)}</td>
                      <td colSpan={2} />
                    </tr>
                  ) : (
                    <tr key={`d-${r.id}`}>
                      <td>{`${r.customerId} - ${r.customerName}`}</td>
                      <td>{r.documentCode}</td>
                      <td>{r.date ? formatDate(r.date) : ''}</td>
                      <td className="text-end">{num(r.originalValue)}</td>
                      <td className="text-end">{num(r.payments)}</td>
                      <td className="text-end">{num(r.creditNotes)}</td>
                      <td className="text-end">{num(r.debitNotes)}</td>
                      <td className="text-end">{num(r.balance)}</td>
                      <td>{r.dueDate ? formatDate(r.dueDate) : ''}</td>
                      <td>{statusText(r)}</td>
                    </tr>
                  )))}
                  {rows.length > 0 && (
                    <tr className="fw-bold">
                      <td colSpan={3}>{t('page.otherReceivableReports.table.grandTotal')}</td>
                      <td className="text-end">{num(totals.originalValue)}</td>
                      <td className="text-end">{num(totals.payments)}</td>
                      <td className="text-end">{num(totals.creditNotes)}</td>
                      <td className="text-end">{num(totals.debitNotes)}</td>
                      <td className="text-end">{num(totals.balance)}</td>
                      <td colSpan={2} />
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default OtherReceivableReports;
