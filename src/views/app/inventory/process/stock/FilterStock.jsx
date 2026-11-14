import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'

// El producto se busca en el servidor (catálogo de 1,000 productos); las unidades salen del producto del último detalle consultado.
const FilterStock = ({ storeId, productCode, dateStart, dateEnd, inputUnit, outputUnit, errors, sendForm, listStores, listProducts, onFilterChange, onProductChange, onProductSearch }) => {
  const showError = (field) => (sendForm && errors[field]) || null;

  return (
    <Row>
      <Colxx xxs="12" lg="6" xxl="5">
        <SearchSelect
          label='select.storeId'
          name='storeId'
          inputValue={storeId}
          options={listStores}
          onChange={onFilterChange}
          feedbackText={showError('storeId')}
        />
      </Colxx>
      <Colxx xxs="12" lg="6" xxl="5">
        <SearchSelect
          label='select.productId'
          name='productCode'
          inputValue={productCode}
          options={listProducts}
          onChange={onProductChange}
          onInputChange={onProductSearch}
          filterOption={null}
          feedbackText={showError('productCode')}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="4" xl="3" xxl="2">
        <InputField name="inputUnit" label='input.inputUnit' value={inputUnit} onChange={() => { }} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="4" xl="3" xxl="2">
        <InputField name="outputUnit" label='input.outputUnit' value={outputUnit} onChange={() => { }} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="12" lg="4" xl="3">
        <DateCalendar
          name="dateStart"
          label="select.dateStart"
          value={dateStart}
          onChange={onFilterChange}
          feedbackText={showError('dateStart')}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="12" lg="4" xl="3">
        <DateCalendar
          name="dateEnd"
          label="select.dateEnd"
          value={dateEnd}
          onChange={onFilterChange}
          feedbackText={showError('dateEnd')}
        />
      </Colxx>
    </Row>
  )
}

export default FilterStock
