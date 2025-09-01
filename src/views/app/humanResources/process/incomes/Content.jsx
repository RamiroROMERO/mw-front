import React from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from '@Components/reactTable';
import { DetailIncomes } from './DetailIncomes';
import { useDetailTable } from './useDetailTable';
import { useIncomes } from './useIncomes';

const Content = ({ setLoading, screenControl }) => {

  const {propsToDetailIncomes, propsToDetailTable, propsToMsgDelete} = useIncomes({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs="12" xxl="7" className="mb-3">
          <DetailIncomes {...propsToDetailIncomes} />
        </Colxx>
        <Colxx xxs="12" xxl="5">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default Content