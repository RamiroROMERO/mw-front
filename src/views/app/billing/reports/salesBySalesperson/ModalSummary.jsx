import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import { COLUMNS, TYPE_SUMMARY } from './salesBySellerRules';

// Resumen de ventas por vendedor y producto (SPEC v2-104-sr): lo que devuelve el back, con Exportar (Excel) e Imprimir (PDF) del mismo reporte.
const ModalSummary = ({ data, setOpen }) => {
  const { dataSummary, downloading, onExport, onPrint } = data;
  const intl = useIntl();

  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(COLUMNS[TYPE_SUMMARY], intl.formatMessage),
    data: dataSummary,
    actions: []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dataSummary, intl.locale]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" disabled={downloading} onClick={() => { onExport() }}>
          <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.export")}
        </Button>
        <Button color="dark" disabled={downloading} onClick={() => { onPrint() }}>
          <i className='bi bi-printer' /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSummary
