import React from 'react'
import { useAbsences } from './useAbsences';
import { useDetailTable } from './useDetailTable';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import DetailAbsences from './DetailAbsences';
import Confirmation from '@/containers/ui/confirmationMsg';

const Content = ({ setLoading, screenControl }) => {

  const {propsToDetail, propsToDetailTable, propsToMsgDelete} = useAbsences({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={12} lg={5} className="mb-3">
          <DetailAbsences {...propsToDetail} />
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