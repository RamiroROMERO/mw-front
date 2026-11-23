import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import { InputField } from '@Components/inputFields';
import { formatNumber } from '@Helpers/Utils';
import { useBoxesReport } from './useBoxesReport';
import HeaderReport from './HeaderReport';
import ModalSummary from './ModalSummary';
import ModalReportTable from './ModalReportTable';
import { CLOSE_COLUMNS, TIP_COLUMNS, ROUTE_CLOSES, ROUTE_SUMMARY, ROUTE_TIPS } from './cashReportRules';

const BoxesReport = ({ setLoading }) => {

  const {
    table, totals, formState, errors, sendForm, onInputChange, downloading, summary, closes, tips, fnReadSummary, fnDownload,
    openModalSummary, setOpenModalSummary, openModalCashClose, setOpenModalCashClose, openModalTips, setOpenModalTips, propsToHeaderReport
  } = useBoxesReport({ setLoading });

  const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.billingReports.modal.viewSummaryPayments.title",
    open: openModalSummary,
    setOpen: setOpenModalSummary,
    maxWidth: 'lg',
    data: {
      formState, errors, sendForm, onInputChange, summary: summary, downloading,
      onView: fnReadSummary,
      onExport: () => fnDownload(ROUTE_SUMMARY, 'xlsx'),
      onPrint: () => fnDownload(ROUTE_SUMMARY, 'pdf')
    }
  }

  const propsToModalCashClose = {
    ModalContent: ModalReportTable,
    title: "page.boxesReport.button.cashClose",
    open: openModalCashClose,
    setOpen: setOpenModalCashClose,
    maxWidth: 'xl',
    data: {
      columns: CLOSE_COLUMNS, rows: closes.rows, downloading,
      onExport: () => fnDownload(ROUTE_CLOSES, 'xlsx'),
      onPrint: () => fnDownload(ROUTE_CLOSES, 'pdf')
    }
  }

  const propsToModalTips = {
    ModalContent: ModalReportTable,
    title: "page.boxesReport.button.tips",
    open: openModalTips,
    setOpen: setOpenModalTips,
    maxWidth: 'lg',
    data: {
      columns: TIP_COLUMNS, rows: tips.rows, downloading,
      onExport: () => fnDownload(ROUTE_TIPS, 'xlsx'),
      onPrint: () => fnDownload(ROUTE_TIPS, 'pdf')
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
          <Row>
            <Colxx xxs="12">
              <ReactTable {...table} />
            </Colxx>
          </Row>
          <Card className='mb-3 mt-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField name="total" label='table.column.total' value={formatNumber(totals.total)} type="text" disabled />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalSummary} />
      <Modal {...propsToModalCashClose} />
      <Modal {...propsToModalTips} />
    </>
  );
}

export default BoxesReport;
