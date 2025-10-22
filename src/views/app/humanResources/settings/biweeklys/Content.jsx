import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import Confirmation from '@Containers/ui/confirmationMsg'
import ReactTable from '@Components/reactTable'
import DetailBiweeklys from './DetailBiweeklys'
import { useBiweeklys } from './useBiweeklys'
import { useDetailTable } from './useDetailTable'

const Biweeklys = ({ setLoading, screenControl }) => {

  const {propsToDetailBiweekly, propsToDetailTable, propsToMsgDelete} = useBiweeklys({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="4">
          <DetailBiweeklys {...propsToDetailBiweekly} />
        </Colxx>
        <Colxx xxs="12" lg="8">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default Biweeklys