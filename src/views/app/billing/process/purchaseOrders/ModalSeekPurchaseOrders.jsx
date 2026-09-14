import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { formatNumber, IntlMessages } from "@Helpers/Utils";
import DateHelper from "@Helpers/DateHelper";
import ReactTable from "@Components/reactTable";

const ModalSeekPurchaseOrders = (props) => {
  const { data, setOpen } = props;
  const { dataPurchaseOrders, fnViewItem, dateFormat } = data;

  const columns = [
    {
      text: IntlMessages("input.number"), dataField: "id", headerStyle: { 'width': '15%' },
      classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
    },
    {
      text: IntlMessages("input.date"), dataField: "date", headerStyle: { 'width': '15%' },
      classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell',
      cell: ({ row }) => DateHelper.formatCompany(row.original.date, dateFormat)
    },
    { text: IntlMessages("input.name"), dataField: "customerName", headerStyle: { 'width': '40%' } },
    {
      text: IntlMessages("input.total"), dataField: "total", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', cell: ({ row }) => { return formatNumber(row.original.total, "L. ", 2) }
    }
  ];
  const actions = [{
    color: 'primary',
    icon: 'eye',
    toolTip: IntlMessages('button.view'),
    onClick: fnViewItem
  }];

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable title='' columns={columns} data={dataPurchaseOrders} actions={actions} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSeekPurchaseOrders;
