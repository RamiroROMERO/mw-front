import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import DataTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import CashBoxDetail from './CashBoxDetail';
import useChashBoxes from './useChashBoxes';
import useTableConf from './useTableConf';

const CashBoxes = (props) => {
  const { setLoading } = props;
  const { propsToDetail, propsToDetailTable, propsToMsgDelete } = useChashBoxes({ setLoading });

  const { tableInfo } = useTableConf({...propsToDetailTable});
  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <CashBoxDetail {...propsToDetail} />
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <DataTable
            {...tableInfo}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CashBoxes;