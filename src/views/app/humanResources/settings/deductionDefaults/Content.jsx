import React from 'react'
import { useDeductionDefaults } from './useDeductionDefaults';
import { useDetailTable } from './useDetailTable';
import { Row } from 'reactstrap';
import ReactTable from "@Components/reactTable";
import { Colxx } from '@/components/common/CustomBootstrap';
import Detail from './Detail';
import Confirmation from '@/containers/ui/confirmationMsg';

const Content = ({setLoading, screenControl}) => {

  const { propsToMsgDelete, propsToDetail, propsToDetailTable} = useDeductionDefaults({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

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