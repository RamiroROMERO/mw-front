import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import Detail from './Detail';
import { useSpecialties } from './useSpecialties';

const Content = (props) => {
  const {setLoading} = props

  const {table, currentItem, setCurrentItem, fnGetData, propsToMsgDelete} = useSpecialties({setLoading});

  const propsToDetail = {
    currentItem,
    setCurrentItem,
    setLoading,
    fnGetData
  }

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
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;