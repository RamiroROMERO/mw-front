import { Card, CardBody, CardTitle, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import CreditNotesProvReport from './CreditNotesProvReport';
import { usePurchaseReport } from './usePurchaseReport';

const PurchaseReport = ({ setLoading }) => {
  const { table, propsToHeaderReport, propsToTotals, propsToCreditNotesProv } = usePurchaseReport({ setLoading });

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
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-3 mt-3">
          <Card>
            <CardBody>
              <CardTitle>{IntlMessages("page.taxPurchaseReport.creditNotesProv.table.title")}</CardTitle>
              <CreditNotesProvReport {...propsToCreditNotesProv} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default PurchaseReport;
