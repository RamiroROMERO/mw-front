import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import { useBoxesReport } from './useBoxesReport';
import HeaderReport from './HeaderReport';
import ModalSummary from './ModalSummary';
import ModalCashClose from './ModalCashClose';
import ModalTips from './ModalTips';

const BoxesReport = ({ setLoading }) => {

  const {
    table, formState, propsToHeaderReport,
    openModalSummary, setOpenModalSummary,
    openModalCashClose, setOpenModalCashClose,
    openModalTips, setOpenModalTips
  } = useBoxesReport({ setLoading });

   const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.billingReports.modal.viewSummaryPayments.title",
    open: openModalSummary,
    setOpen: setOpenModalSummary,
    maxWidth: 'lg',
    data: {
      setLoading
    }
  }

  const propsToModalCashClose = {
    ModalContent: ModalCashClose,
    title: "page.boxesReport.button.cashClose",
    open: openModalCashClose,
    setOpen: setOpenModalCashClose,
    maxWidth: 'xl',
    data: {
      setLoading,
      startDate: formState.startDate,
      endDate: formState.endDate
    }
  }

  const propsToModalTips = {
    ModalContent: ModalTips,
    title: "page.boxesReport.button.tips",
    open: openModalTips,
    setOpen: setOpenModalTips,
    maxWidth: 'lg',
    data: {
      setLoading,
      startDate: formState.startDate,
      endDate: formState.endDate
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
        </Colxx>
      </Row>
      <Modal {...propsToModalSummary} />
      <Modal {...propsToModalCashClose} />
      <Modal {...propsToModalTips} />
    </>
  );
}
export default BoxesReport;