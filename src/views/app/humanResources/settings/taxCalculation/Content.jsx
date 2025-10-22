import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailCalculation from './DetailCalculation';
import ReactTable from '@Components/reactTable';
import { useTaxCalculation } from './useTaxCalculation';
import useDetailTable from './useDetailTable';

const TaxCalculation = (props) => {
  const { setLoading, screenControl } = props;

  const {propsToDetailCalculation, propsToDetailTable, propsToMsgDelete} = useTaxCalculation({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4">
          <DetailCalculation {...propsToDetailCalculation} />
        </Colxx>
        <Colxx xss="12" lg="8">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default TaxCalculation;