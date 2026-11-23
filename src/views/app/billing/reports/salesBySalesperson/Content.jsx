import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import { InputField } from '@Components/inputFields';
import { formatNumber } from '@Helpers/Utils';
import TotalsReport from '@Views/app/inventory/reports/purchaseReport/TotalsReport';
import { useSalesBySalesperson } from './useSalesBySalesperson'
import HeaderReport from './HeaderReport';
import ModalSummary from './ModalSummary';
import ModalNewCustomers from './ModalNewCustomers';
import { TYPE_NEW_CUSTOMERS, TYPE_SUMMARY } from './salesBySellerRules';

const Content = ({ setLoading }) => {

  const {
    table, totals, dataSummary, dataNewCustomers, downloading, fnDownload, openModalViewSummary, openModalNewCustomers, setOpenModalViewSummary, setOpenModalNewCustomers,
    propsToHeaderReport
  } = useSalesBySalesperson({ setLoading });

  const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.billingReports.modal.viewSummary.title",
    open: openModalViewSummary,
    setOpen: setOpenModalViewSummary,
    maxWidth: 'xl',
    data: {
      dataSummary,
      downloading,
      onExport: () => fnDownload(TYPE_SUMMARY, 'xlsx'),
      onPrint: () => fnDownload(TYPE_SUMMARY, 'pdf')
    }
  }

  const propsToModalNewCustomers = {
    ModalContent: ModalNewCustomers,
    title: "page.billingReports.modal.newCustomers.title",
    open: openModalNewCustomers,
    setOpen: setOpenModalNewCustomers,
    maxWidth: 'xl',
    data: {
      dataNewCustomers,
      downloading,
      onExport: () => fnDownload(TYPE_NEW_CUSTOMERS, 'xlsx'),
      onPrint: () => fnDownload(TYPE_NEW_CUSTOMERS, 'pdf')
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
                <Colxx xxs="12">
                  <TotalsReport subtotal={totals.subtotal} tax={totals.tax} total={totals.total} />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: totals.commissionValue !== undefined ? 'block' : 'none' }}>
                  <InputField
                    name="commissionValue"
                    label='table.column.commissionValue'
                    value={formatNumber(totals.commissionValue)}
                    type="text"
                    disabled
                  />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalSummary} />
      <Modal {...propsToModalNewCustomers} />
    </>
  )
}

export default Content
