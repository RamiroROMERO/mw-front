import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { Checkbox } from '@/components/checkbox'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { useFooter } from './useFooter'

const FooterRequisitions = ({notes, isWorkOrder, workOrderId, onInputChange, listWorkOrders, onBulkForm, showWorkOrder, setShowWorkOrder}) => {

  const {onAssignOTChange} = useFooter({onBulkForm, setShowWorkOrder});

  return (
    <>
    <Row>
      <Colxx xxs="12">
        <InputField
          name="notes"
          label='input.notes'
          value={notes}
          onChange={onInputChange}
          type="textarea"
        />
      </Colxx>
      <Colxx xxs="12" sm="3" lg="2">
        <Checkbox
          onChange={onAssignOTChange}
          name="isWorkOrder"
          value={isWorkOrder}
          label="page.requisitions.check.assignOT"
        />
      </Colxx>
      <Colxx xxs="12" sm="9" lg="7" xl="5" style={{display: showWorkOrder}}>
        <SearchSelect
          label='select.workOrderId'
          name='workOrderId'
          inputValue={workOrderId}
          options={listWorkOrders}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
    </>
  )
}

export default FooterRequisitions