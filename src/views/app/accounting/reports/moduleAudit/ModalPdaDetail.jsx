import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Drill-down del legacy (Grid1.Column8, flecha azul de la pestaña Detalle): desglose real
// de la Partida (cont_pda) generada para el documento seleccionado.
const ModalPdaDetail = ({ data, setOpen }) => {
  const { detail, formatNumber } = data;

  if (!detail) return null;
  const { pdaNumber, lines } = detail;

  const table = {
    columns: [
      { text: IntlMessages('page.moduleAudit.modal.pdaDetail.account'), dataField: 'accountCode', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.moduleAudit.modal.pdaDetail.accountName'), dataField: 'accountName', headerStyle: { width: '40%' } },
      {
        text: IntlMessages('page.moduleAudit.modal.pdaDetail.debit'),
        dataField: 'debit',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.debit)
      },
      {
        text: IntlMessages('page.moduleAudit.modal.pdaDetail.credit'),
        dataField: 'credit',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.credit)
      }
    ],
    data: lines || [],
    options: { pageSize: 10 }
  };

  const totalDebit = (lines || []).reduce((sum, r) => sum + Number(r.debit || 0), 0);
  const totalCredit = (lines || []).reduce((sum, r) => sum + Number(r.credit || 0), 0);

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12">
            <strong>{IntlMessages('page.moduleAudit.modal.pdaDetail.pdaNumber')}:</strong> {pdaNumber}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" className="text-end">
            <strong>{IntlMessages('page.moduleAudit.modal.pdaDetail.debit')}:</strong> {formatNumber(totalDebit)}
          </Colxx>
          <Colxx xxs="6" className="text-end">
            <strong>{IntlMessages('page.moduleAudit.modal.pdaDetail.credit')}:</strong> {formatNumber(totalCredit)}
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

export default ModalPdaDetail
