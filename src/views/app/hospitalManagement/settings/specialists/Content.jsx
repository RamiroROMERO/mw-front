import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import Detail from './Detail';
import { useSpecialist } from './useSpecialist';

const Content = (props) => {
  const {setLoading} = props

  const {table, currentItem, setCurrentItem, fnGetData, propsToMsgDelete, listSpecialties} = useSpecialist({setLoading});

  const propsToDetail = {
    currentItem,
    setCurrentItem,
    setLoading,
    listSpecialties,
    fnGetData
  }

  return (
    <>
      <Row>
        <Colxx xxs={12} lg={5}>
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs={12} lg={7}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;