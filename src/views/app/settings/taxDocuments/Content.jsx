import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from "@/components/reactTable"
import Confirmation from '@/containers/ui/confirmationMsg';
import { useTaxDocuments } from './useTaxDocuments';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const TaxDocuments = (props) => {
  const { setLoading } = props;

  const {propsToDetail, propsToDetailTable, propsToMsgDelete} = useTaxDocuments({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xss="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TaxDocuments;
