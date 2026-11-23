import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import { InputField } from '@Components/inputFields';
import { formatNumber } from '@Helpers/Utils';
import { useOtherSalesReports } from './useOtherSalesReports';
import HeaderReport from './HeaderReport';
import { grandTotal } from './otherSalesRules';

const OtherSalesReports = ({ setLoading }) => {
  const { table, totals, propsToHeaderReport } = useOtherSalesReports({ setLoading });
  const total = grandTotal(totals);

  return (
    <Row>
      <Colxx xxs="12">
        <Card className='mb-3'>
          <CardBody>
            <HeaderReport {...propsToHeaderReport} />
          </CardBody>
        </Card>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        {total !== undefined && (
          <Card className='mb-3 mt-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField name="total" label='table.column.total' value={formatNumber(total)} type="text" disabled />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        )}
      </Colxx>
    </Row>
  );
}
export default OtherSalesReports;
