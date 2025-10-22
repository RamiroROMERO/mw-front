import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailTypes from './DetailTypes';
import ReactTable from '@Components/reactTable';
import { useFaultTypes } from './useFaultTypes';
import useDetailTable from './useDetailTable';

const FaultTypes = (props) => {
  const { setLoading, screenControl } = props;

  const {propsToDetailTable, propsToDetailTypes, propsToMsgDelete} = useFaultTypes({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable})

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4">
          <DetailTypes {...propsToDetailTypes} />
        </Colxx>
        <Colxx xss="12" lg="8">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default FaultTypes;