import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useCxPCashInvoices } from './useCxPCashInvoices';

const CxPCashInvoices = ({ setLoading }) => {
  const { table, totalBalance, fnExportXlsx, propsToConfirm } = useCxPCashInvoices({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody className="d-flex justify-content-end">
              <Button color="secondary" onClick={fnExportXlsx}>
                <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
              </Button>
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
        <Colxx xxs="12" sm="3">
          <Card>
            <CardBody>
              <InputField name="totalBalance" label="page.cxpCashInvoices.table.totalBalance" value={totalBalance} type="text" bold disabled />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToConfirm} />
    </>
  );
}
export default CxPCashInvoices;
