import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { useDaysTypes } from './useDaysTypes';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const Content = (props) => {
  const {setLoading, screenControl} = props;

  const {propsToMsgDelete, propsToDetail, propsToDetailTable} = useDaysTypes({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable})

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
  )
}

export default Content