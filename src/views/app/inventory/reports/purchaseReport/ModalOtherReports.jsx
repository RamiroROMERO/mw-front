import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { useModalOtherReports } from './useModalOtherReports'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import { Checkbox } from '@/components/checkbox'
import { RadioGroup } from '@/components/radioGroup'

const ModalOtherReports = ({setOpen, data}) => {
  const {listProviders, listStores, listProducts} = data;

  const {formState, onInputChange, fnPrintOtherReport} = useModalOtherReports({});

  const {providerId, storeId, productId, dateStart, dateEnd, exportToXls, typeReport} = formState;

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
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateStart"
              label='select.dateStart'
              value={dateStart}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="dateEnd"
              label='select.dateEnd'
              value={dateEnd}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <Checkbox
              name="exportToXls"
              label='check.exportToXls'
              value={exportToXls}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <RadioGroup
              label="select.type"
              name="typeReport"
              value={typeReport}
              onChange={onInputChange}
              options={[
                {id:1, label: 'page.purchaseReport.modal.otherReports.radio.byStore'},
                {id:2, label: 'page.purchaseReport.modal.otherReports.radio.byProvider'},
                {id:3, label: 'page.purchaseReport.modal.otherReports.radio.totalByStore'},
                {id:4, label: 'page.purchaseReport.modal.otherReports.radio.totalByProvider'},
                {id:5, label: 'page.purchaseReport.modal.otherReports.radio.byProduct'},
                {id:6, label: 'page.purchaseReport.modal.otherReports.radio.detailMonth'},
                {id:7, label: 'page.purchaseReport.modal.otherReports.radio.bonus'},
                {id:8, label: 'page.purchaseReport.modal.otherReports.radio.taxedDetail'},
                {id:9, label: 'page.purchaseReport.modal.otherReports.radio.taxedSummarized'},
                {id:10, label: 'page.purchaseReport.modal.otherReports.radio.forDeclaration'},
                {id:11, label: 'page.purchaseReport.modal.otherReports.radio.byExpenses'},
                {id:12, label: 'page.purchaseReport.modal.otherReports.radio.byProdQty'},
                {id:13, label: 'page.purchaseReport.modal.otherReports.radio.detailServices'}
              ]}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintOtherReport}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalOtherReports