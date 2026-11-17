import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useModalOtherReports } from './useModalOtherReports'
import { Colxx } from '@Components/common/CustomBootstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { RadioGroup } from '@Components/radioGroup'
import ReactTable from '@Components/reactTable'

const ModalOtherReports = ({ setOpen, data }) => {
  const { listProviders, listStores, listProducts, onProductSearch, setLoading } = data;

  const { formState, errors, sendForm, downloading, onInputChange, onTypeChange, fnSearchOtherReport, fnDownloadOtherReport, data: reportData, columns } = useModalOtherReports({ setLoading, onProductSearch });

  const { providerId, storeId, productId, dateStart, dateEnd, typeReport } = formState;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label='select.providerId'
              name='providerId'
              inputValue={providerId}
              options={listProviders}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label='select.storeId'
              name='storeId'
              inputValue={storeId}
              options={listStores}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label='select.productId'
              name='productId'
              inputValue={productId}
              options={listProducts}
              onChange={onInputChange}
              onInputChange={onProductSearch}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateStart"
              label='select.dateStart'
              value={dateStart}
              onChange={onInputChange}
              feedbackText={sendForm ? errors.dateStart : undefined}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateEnd"
              label='select.dateEnd'
              value={dateEnd}
              onChange={onInputChange}
              feedbackText={sendForm ? errors.dateEnd : undefined}
            />
          </Colxx>
          <Colxx xxs="12">
            <RadioGroup
              label="select.type"
              name="typeReport"
              value={typeReport}
              onChange={onTypeChange}
              options={[
                { id: 1, label: 'page.purchaseReport.modal.otherReports.radio.byStore' },
                { id: 2, label: 'page.purchaseReport.modal.otherReports.radio.byProvider' },
                { id: 3, label: 'page.purchaseReport.modal.otherReports.radio.totalByStore' },
                { id: 4, label: 'page.purchaseReport.modal.otherReports.radio.totalByProvider' },
                { id: 5, label: 'page.purchaseReport.modal.otherReports.radio.byProduct' },
                { id: 6, label: 'page.purchaseReport.modal.otherReports.radio.detailMonth' },
                { id: 7, label: 'page.purchaseReport.modal.otherReports.radio.bonus' },
                { id: 8, label: 'page.purchaseReport.modal.otherReports.radio.taxedDetail' },
                { id: 9, label: 'page.purchaseReport.modal.otherReports.radio.taxedSummarized' },
                { id: 10, label: 'page.purchaseReport.modal.otherReports.radio.forDeclaration' },
                { id: 11, label: 'page.purchaseReport.modal.otherReports.radio.byExpenses' },
                { id: 12, label: 'page.purchaseReport.modal.otherReports.radio.byProdQty' },
                { id: 13, label: 'page.purchaseReport.modal.otherReports.radio.detailServices' }
              ]}
            />
          </Colxx>
        </Row>
        {reportData.length > 0 && (
          <Row className="mt-3">
            <Colxx xxs="12">
              <ReactTable columns={columns} data={reportData} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSearchOtherReport}>
          <i className="bi bi-search" /> {IntlMessages("button.search")}
        </Button>
        <Button color="secondary" disabled={downloading} onClick={() => fnDownloadOtherReport('xlsx')}>
          <i className="bi bi-file-earmark-excel" /> {IntlMessages("page.purchaseReport.button.excel")}
        </Button>
        <Button color="info" disabled={downloading} onClick={() => fnDownloadOtherReport('pdf')}>
          <i className="bi bi-printer" /> {IntlMessages("page.purchaseReport.button.pdf")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalOtherReports
