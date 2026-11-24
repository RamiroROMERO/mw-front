import { useIntl } from 'react-intl';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Drill-down del legacy (flecha azul del detalle): encabezado y líneas de la partida (cont_pda) del documento seleccionado, con totales en centavos.
const ModalPdaDetail = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { detail, formatNumber } = data;
  if (!detail) return null;
  const { pdaNumber, header, lines, totalDebit, totalCredit } = detail;

  const table = {
    columns: [
      { text: t('page.moduleAudit.modal.pdaDetail.account'), dataField: 'accountCode', headerStyle: { width: '16%' } },
      { text: t('page.moduleAudit.modal.pdaDetail.accountName'), dataField: 'accountName', headerStyle: { width: '30%' } },
      { text: t('page.moduleAudit.table.description'), dataField: 'description', headerStyle: { width: '26%' } },
      { text: t('page.moduleAudit.modal.pdaDetail.debit'), dataField: 'debit', headerStyle: { width: '14%' }, cell: ({ row }) => formatNumber(row.original.debit) },
      { text: t('page.moduleAudit.modal.pdaDetail.credit'), dataField: 'credit', headerStyle: { width: '14%' }, cell: ({ row }) => formatNumber(row.original.credit) }
    ],
    data: lines,
    options: { pageSize: 10 }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12" md="4"><strong>{t('page.moduleAudit.modal.pdaDetail.pdaNumber')}:</strong> {pdaNumber}</Colxx>
          {header && <Colxx xxs="12" md="8"><strong>{t('page.moduleAudit.table.description')}:</strong> {header.description}</Colxx>}
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" className="text-end"><strong>{t('page.moduleAudit.modal.pdaDetail.debit')}:</strong> {formatNumber(totalDebit)}</Colxx>
          <Colxx xxs="6" className="text-end"><strong>{t('page.moduleAudit.modal.pdaDetail.credit')}:</strong> {formatNumber(totalCredit)}</Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {t('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalPdaDetail;
