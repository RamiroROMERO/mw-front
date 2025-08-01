import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { useModalStock } from './useModalStock'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import { Checkbox } from '@/components/checkbox'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'

const ModalStockReport = ({setOpen, data}) => {
  const {listStores, listProducts} = data;

  const {formState, productsByStore, onInputChange, onStoreChange, onProductChange, fnPrintReport} = useModalStock({listProducts});

  const {storeId, productId, inputUnit, outputUnit, dateStart, dateEnd, typeValues, exportToXls, typeReport} = formState;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label='select.storeId'
              name='storeId'
              inputValue={storeId}
              options={listStores}
              onChange={onStoreChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label='select.productId'
              name='productId'
              inputValue={productId}
              options={productsByStore}
              onChange={onProductChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <InputField
              name="inputUnit"
              label='input.inputUnit'
              value={inputUnit}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <InputField
              name="outputUnit"
              label='input.outputUnit'
              value={outputUnit}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateStart"
              label="select.dateStart"
              value={dateStart}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateEnd"
              label="select.dateEnd"
              value={dateEnd}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <RadioGroup
              label="page.stock.modal.stockReports.radio.typeValues"
              name="typeValues"
              value={typeValues}
              onChange={onInputChange}
              options={[
                {id:1, label: 'page.stock.modal.stockReports.radio.negatives'},
                {id:2, label: 'page.stock.modal.stockReports.radio.existence'},
                {id:3, label: 'page.stock.modal.stockReports.radio.all'}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <RadioGroup
              label="page.stock.modal.stockReports.radio.type"
              name="typeReport"
              value={typeReport}
              onChange={onInputChange}
              options={[
                {id:1, label: 'page.stock.modal.stockReports.radio.generalStock'},
                {id:2, label: 'page.stock.modal.stockReports.radio.stockReport'},
                {id:3, label: 'page.stock.modal.stockReports.radio.nonMovingProducts'}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <Checkbox
              name="exportToXls"
              label='page.stock.modal.stockReports.check.exportToXls'
              value={exportToXls}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintReport}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}}>
          <i className="bi bi-box-arrow-right"/> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalStockReport