import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import { useResponsibles } from './useResponsbiles';
import { Detail } from './Detail';
import { useDetailTable } from './useDetailTable';

const Content = (props) => {
  const {setLoading} = props;

  const {propsToMsgDelete, propsToDetail, propsToDetailTable} = useResponsibles({setLoading});

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
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;