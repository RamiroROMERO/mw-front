import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'

// Filtros del reporte de inventario (SPEC v2-60-sr). `feedbackText` recibe la CLAVE de traducción (el componente la traduce).
const HeaderReport = ({ storeId, destinationId, productCode, dateStart, dateEnd, errors, sendForm, onInputChange, onProductSearch, listStores, listDestinations, listProducts, fnSearchReport, fnOtherReport }) => {
  const show = (field) => (sendForm ? errors[field] : undefined);
  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6" xxl="4">
          <SearchSelect label='select.storeId' name='storeId' inputValue={storeId} options={listStores} onChange={onInputChange} feedbackText={show('storeId')} />
        </Colxx>
        <Colxx xxs="12" lg="6" xxl="4">
          <SearchSelect label='select.destinationId' name='destinationId' inputValue={destinationId} options={listDestinations} onChange={onInputChange} />
        </Colxx>
        <Colxx xxs="12" lg="6" xxl="4">
          <SearchSelect label='select.productId' name='productCode' inputValue={productCode} options={listProducts} onChange={onInputChange} onInputChange={onProductSearch} />
        </Colxx>
        <Colxx xxs="12" xs="6" lg="3">
          <DateCalendar name="dateStart" label='select.dateStart' value={dateStart} onChange={onInputChange} feedbackText={show('dateStart')} />
        </Colxx>
        <Colxx xxs="12" xs="6" lg="3">
          <DateCalendar name="dateEnd" label='select.dateEnd' value={dateEnd} onChange={onInputChange} feedbackText={show('dateEnd')} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="success" onClick={() => { fnOtherReport() }}>
            <i className='bi bi-file-earmark-bar-graph' /> {IntlMessages("button.otherReports")}
          </Button>
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport
