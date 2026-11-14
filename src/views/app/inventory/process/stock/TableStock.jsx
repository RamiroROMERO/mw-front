import { useCallback, useMemo } from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable'
import { formatQty, documentLabel } from './kardexRules';

const money = (value) => formatNumber(Number(value) || 0, '', 2);
const OPTIONS = { pageSize: 50, pageSizeOptions: [20, 50, 100, 200] };
const RIGHT = { textAlign: 'right' };

// Detalle del kardex: una fila por movimiento y la de saldo inicial. Orden y existencia corrida vienen del back.
const TableStock = ({ rows }) => {
  const intl = useIntl();
  const t = useCallback((id) => intl.formatMessage({ id }), [intl]);
  const columns = useMemo(() => [
    { text: t("table.column.type"), dataField: "documentType" },
    { text: t("table.column.date"), dataField: "date" },
    { text: t("page.stock.table.column.document"), dataField: "documentId", cell: ({ row }) => documentLabel(row.original) },
    { text: t("page.stock.table.column.qtyInput"), dataField: "qtyIn", style: RIGHT, cell: ({ row }) => formatQty(row.original.qtyIn) },
    { text: t("page.stock.table.column.valueInput"), dataField: "valueIn", style: RIGHT, cell: ({ row }) => money(row.original.valueIn) },
    { text: t("page.stock.table.column.qtyOutput"), dataField: "qtyOut", style: RIGHT, cell: ({ row }) => formatQty(row.original.qtyOut) },
    { text: t("page.stock.table.column.valueOutput"), dataField: "valueOut", style: RIGHT, cell: ({ row }) => money(row.original.valueOut) },
    { text: t("page.stock.table.column.unitCost"), dataField: "unitCost", style: RIGHT, cell: ({ row }) => money(row.original.unitCost) },
    { text: t("page.stock.table.column.stock"), dataField: "stock", style: RIGHT, cell: ({ row }) => formatQty(row.original.stock) },
    { text: t("page.stock.table.column.lot"), dataField: "lotCode" },
    { text: t("page.stock.table.column.expirationDate"), dataField: "dateExp" },
    { text: t("table.column.userName"), dataField: "createdByName" },
    { text: t("table.column.provider"), dataField: "providerName" }
  ], [t]);

  return (
    <Row>
      <Colxx xxs="12">
        <ReactTable title={t("page.stock.tableDetail.title")} columns={columns} data={rows} options={OPTIONS} actions={[]} />
      </Colxx>
    </Row>
  )
}

export default TableStock
