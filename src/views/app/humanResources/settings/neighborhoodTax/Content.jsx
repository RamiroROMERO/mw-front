import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailTax from './DetailTax';
import ReactTable from '@Components/reactTable';
import { useNeighborhoodTax } from './useNeighborhoodTax';
import useDetailTable from './useDetailTable';

const NeighborhoodTax = (props) => {
  const { setLoading } = props;

  const {propsToDetailTable, propsToDetailTax, propsToMsgDelete} = useNeighborhoodTax({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4" >
          <DetailTax {...propsToDetailTax} />
        </Colxx>
        <Colxx xss="12" lg="8">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default NeighborhoodTax