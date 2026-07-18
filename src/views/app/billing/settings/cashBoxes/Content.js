import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import DataTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import { IntlMessages } from "@/helpers/Utils";
import { useTableConfig } from '@Hooks';
import CashBoxDetail from './CashBoxDetail';
import useChashBoxes from './useChashBoxes';

const CashBoxes = (props) => {
  const { setLoading } = props;
  const { propsToDetail, propsToDetailTable, propsToMsgDelete } = useChashBoxes({ setLoading });
  const { tableData, fnEditItem, fnDeleteItem } = propsToDetailTable;

  const { tableInfo } = useTableConfig({
    title: IntlMessages("page.cashBoxes.table.title"),
    columns: [
      { text: IntlMessages("page.cashBoxes.table.name"), dataField: "name", headerStyle: { 'width': '50%' } },
      { text: IntlMessages("table.column.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '25%' } },
    ],
    data: tableData,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });
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