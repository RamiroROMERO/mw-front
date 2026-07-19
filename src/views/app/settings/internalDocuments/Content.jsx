import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from "@Components/reactTable";
import Confirmation from '@Containers/ui/confirmationMsg';
import { useInternalDocuments } from './useInternalDocuments';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const InternalDocuments = (props) => {
  const { setLoading } = props;

  const {propsToDetail, propsToDetailTable, propsToMsgDelete} = useInternalDocuments({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs="12">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default InternalDocuments;
