import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { useTypes } from './useTypes';
import { Detail } from './Detail';
import { useDetailTable } from './useDetailTable';

const Content = (props) => {
  const { setLoading } = props;

  const { propsToMsgDelete, propsToDetailTable, propsToDetail } = useTypes({ setLoading });

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={5}>
          <Detail {...propsToDetail} />
        </Colxx>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={7}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Content;