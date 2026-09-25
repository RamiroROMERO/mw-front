import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Vista previa del Estado de Resultados (equivalente al cómputo interno de
// btnSaldoER.Click, que en el legacy nunca se muestra en pantalla — ver hook).
const TYPE_LABELS = {
  1: 'page.accountingClosures.modal.incomeStatement.type.income',
  2: 'page.accountingClosures.modal.incomeStatement.type.costOfSales',
  3: 'page.accountingClosures.modal.incomeStatement.type.expenses',
  4: 'page.accountingClosures.modal.incomeStatement.type.otherIncome',
  5: 'page.accountingClosures.modal.incomeStatement.type.otherExpenses',
  6: 'page.accountingClosures.modal.incomeStatement.type.tax'
};

const ModalIncomeStatement = ({ data, setOpen }) => {
  const { incomeStatement, formatNumber } = data;
  // Precomputado FUERA del cell renderer (que corre una vez por fila) — IntlMessages()
  // llama a useIntl() internamente, invocarlo dentro de un callback por-fila viola las
  // reglas de hooks (ver feedback_intlmessages_hook_order_gotcha).
  const typeLabels = {
    1: IntlMessages(TYPE_LABELS[1]), 2: IntlMessages(TYPE_LABELS[2]), 3: IntlMessages(TYPE_LABELS[3]),
    4: IntlMessages(TYPE_LABELS[4]), 5: IntlMessages(TYPE_LABELS[5]), 6: IntlMessages(TYPE_LABELS[6])
  };

  if (!incomeStatement) return null;
  const { rows, totals, dateStart, dateEnd } = incomeStatement;

  const table = {
    columns: [
      {
        text: IntlMessages('page.accountingClosures.modal.incomeStatement.type'),
        dataField: 'type',
        headerStyle: { width: '20%' },
        cell: ({ row }) => typeLabels[row.original.type]
      },
      { text: IntlMessages('page.accountingClosures.modal.incomeStatement.account'), dataField: 'accountName', headerStyle: { width: '45%' } },
      {
        text: IntlMessages('page.accountingClosures.modal.incomeStatement.monthValue'),
        dataField: 'monthValue',
        headerStyle: { width: '17.5%' },
        cell: ({ row }) => formatNumber(row.original.monthValue)
      },
      {
        text: IntlMessages('page.accountingClosures.modal.incomeStatement.yearValue'),
        dataField: 'yearValue',
        headerStyle: { width: '17.5%' },
        cell: ({ row }) => formatNumber(row.original.yearValue)
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12">
            <strong>{IntlMessages('page.accountingClosures.modal.incomeStatement.period')}:</strong> {dateStart} - {dateEnd}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" sm="3" className="text-end mb-2">
            <strong>{IntlMessages('page.accountingClosures.modal.incomeStatement.grossProfit')}:</strong><br />{formatNumber(totals.grossProfit)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end mb-2">
            <strong>{IntlMessages('page.accountingClosures.modal.incomeStatement.operatingIncome')}:</strong><br />{formatNumber(totals.operatingIncome)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end mb-2">
            <strong>{IntlMessages('page.accountingClosures.modal.incomeStatement.incomeBeforeTax')}:</strong><br />{formatNumber(totals.incomeBeforeTax)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end mb-2">
            <strong>{IntlMessages('page.accountingClosures.modal.incomeStatement.netIncome')}:</strong><br />
            <span className={totals.netIncome >= 0 ? 'text-success' : 'text-danger'}>{formatNumber(totals.netIncome)}</span>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalIncomeStatement
