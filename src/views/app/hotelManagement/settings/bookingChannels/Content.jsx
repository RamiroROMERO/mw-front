import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useBookingChannels } from './useBookingChannels';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const Content = ({setLoading, screenControl}) => {

  const {propsToDetail, propsToDetailTable, propsToMsgDisable} = useBookingChannels({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={12} lg={5}>
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs={12} xs={12} sm={12} md={12} lg={7}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDisable}/>
    </>
  )
}

export default Content