import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailOvertime from './DetailOvertime';
import ReactTable from '@Components/reactTable';
import { useOvertime } from './useOvertime';
import useDetailTable from './useDetailTable';

const Overtime = (props) => {
  const { setLoading, screenControl } = props;

  const {propsToDetailOvertime, propsToDetailTable, propsToMsgDelete} = useOvertime({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4">
          <DetailOvertime {...propsToDetailOvertime} />
        </Colxx>
        <Colxx xss="12" lg="8">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Overtime;