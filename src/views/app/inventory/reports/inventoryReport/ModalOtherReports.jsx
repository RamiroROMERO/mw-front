import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Checkbox } from '@/components/checkbox'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import { useModalOtherReports } from './useModalOtherReports'
import { RadioGroup } from '@/components/radioGroup'

const ModalOtherReports = ({setOpen, data}) => {
  const {listStores} = data;

  const {formState, onInputChange, fnPrintOtherReport} = useModalOtherReports({});

  const {storeId, dateStart, dateEnd, exportToXls, typeReport} = formState;

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
                {id:1, label: 'page.inventoryReport.modal.otherReports.radio.detailByDestination'},
                {id:2, label: 'page.inventoryReport.modal.otherReports.radio.summarizedByDestination'},
                {id:3, label: 'page.inventoryReport.modal.otherReports.radio.detailExpense'},
                {id:4, label: 'page.inventoryReport.modal.otherReports.radio.summarizedExpense'},
                {id:5, label: 'page.inventoryReport.modal.otherReports.radio.byStore'},
                {id:6, label: 'page.inventoryReport.modal.otherReports.radio.general'}
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