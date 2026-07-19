import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DataTable from "@Components/reactTable";
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages } from "@Helpers/Utils";
import { useTableConfig } from '@Hooks';
import CashBoxDetail from './CashBoxDetail';
import useCashBoxes from './useCashBoxes';

const CashBoxes = (props) => {
  const { setLoading } = props;
  const { propsToDetail, propsToDetailTable, propsToMsgDelete } = useCashBoxes({ setLoading });
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