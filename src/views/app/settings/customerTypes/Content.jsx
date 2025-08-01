import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import { useCustomerTypes } from './useCustomerTypes';
import { useDetailTable } from './useDetailTable';
import { Detail } from './Detail';

const CustomerTypes = (props) => {
  const { setLoading } = props;

  const {propsToDetail, propsToDetailTable, propsToMsgDelete} = useCustomerTypes({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="5">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs="12" lg="7">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CustomerTypes;