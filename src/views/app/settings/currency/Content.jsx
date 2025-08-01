import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from "@/components/reactTable"
import Confirmation from '@/containers/ui/confirmationMsg';
import { useCurrency } from './useCurrency';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const Currency = (props) => {
  const { setLoading } = props;

  const {propsToDetail, propsToDetailTable, propsToMsgDelete} = useCurrency({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Currency;