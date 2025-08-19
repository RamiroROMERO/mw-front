import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailDeductions from './DetailDeductions';
import useDetailTable from './useDetailTable';
import ReactTable from '@Components/reactTable'
import { useDeductions } from './useDeductions';

const Deductions = ({ setLoading }) => {

  const {propsToDetailDeductions, propsToDetailTable, propsToMsgDelete} = useDeductions({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" xxl="7" className="mb-3">
          <DetailDeductions {...propsToDetailDeductions} />
        </Colxx>
        <Colxx xxs="12" xxl="5">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default Deductions