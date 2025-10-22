import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailSchedules from './DetailSchedules';
import ReactTable from '@Components/reactTable';
import { useSchedules } from './useSchedules';
import useDetailTable from './useDetailTable';

const Schedules = (props) => {
  const { setLoading, screenControl } = props;

  const {propsToMsgDelete, propsToDetailSchedules, propsToDetailTable} = useSchedules({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xss="12" lg="6">
          <DetailSchedules {...propsToDetailSchedules} />
        </Colxx>
        <Colxx xs="12" lg="6">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Schedules;