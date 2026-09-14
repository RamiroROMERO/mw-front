import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import { useOtherSalesReports } from './useOtherSalesReports';
import HeaderReport from './HeaderReport';

const OtherSalesReports = ({ setLoading }) => {
  const { table, propsToHeaderReport } = useOtherSalesReports({ setLoading });

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
      </Colxx>
    </Row>
  );
}
export default OtherSalesReports;
