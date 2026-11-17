import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { RadioGroup } from '@Components/radioGroup'
import ReactTable from '@Components/reactTable'
import { useModalOtherReports } from './useModalOtherReports'
import { REPORT_TYPES } from './inventoryReportRules'

const ModalOtherReports = ({ setOpen, data }) => {
  const { listStores, listDestinations, listProducts, onProductSearch, setLoading } = data;
  const s = useModalOtherReports({ setLoading });
  const { formState, errors, sendForm } = s;
  const show = (field) => (sendForm ? errors[field] : undefined);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup label="select.type" name="typeId" value={formState.typeId} onChange={s.onTypeChange} options={REPORT_TYPES.map(({ id, label }) => ({ id, label }))} feedbackText={show('typeId')} />
          </Colxx>
          {s.showStore && (
            <Colxx xxs="12" md="6" xl="4">
              <SearchSelect label='select.storeId' name='storeId' inputValue={formState.storeId} options={listStores} onChange={s.onInputChange} feedbackText={show('storeId')} />
            </Colxx>
          )}
          {s.showDestination && (
            <Colxx xxs="12" md="6" xl="4">
              <SearchSelect label='select.destinationId' name='destinationId' inputValue={formState.destinationId} options={listDestinations} onChange={s.onInputChange} />
            </Colxx>
          )}
          {s.showProduct && (
            <Colxx xxs="12" md="6" xl="4">
              <SearchSelect label='select.productId' name='productCode' inputValue={formState.productCode} options={listProducts} onChange={s.onInputChange} onInputChange={onProductSearch} />
            </Colxx>
          )}
          {s.showDates && (
            <>
              <Colxx xxs="12" xs="6" md="3">
                <DateCalendar name="dateStart" label='select.dateStart' value={formState.dateStart} onChange={s.onInputChange} feedbackText={show('dateStart')} />
              </Colxx>
              <Colxx xxs="12" xs="6" md="3">
                <DateCalendar name="dateEnd" label='select.dateEnd' value={formState.dateEnd} onChange={s.onInputChange} feedbackText={show('dateEnd')} />
              </Colxx>
            </>
          )}
        </Row>
        {s.data.length > 0 && (
          <Row className="mt-3">
            <Colxx xxs="12">
              <ReactTable columns={s.columns} data={s.data} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={s.fnSearchOtherReport}>
          <i className="bi bi-search" /> {IntlMessages("button.search")}
        </Button>
        <Button color="secondary" disabled={s.downloading} onClick={() => s.fnDownloadOtherReport('xlsx')}>
          <i className="bi bi-file-earmark-excel" /> {IntlMessages("page.purchaseReport.button.excel")}
        </Button>
        <Button color="info" disabled={s.downloading} onClick={() => s.fnDownloadOtherReport('pdf')}>
          <i className="bi bi-printer" /> {IntlMessages("page.purchaseReport.button.pdf")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalOtherReports
