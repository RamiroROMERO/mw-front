import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import { useRooms } from './useRooms';
import Detail from './Detail';

const Content = (props) => {
  const {setLoading} = props;

  const {table, currentItem, setCurrentItem, fnGetData, propsToMsgDelete} = useRooms({setLoading});

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