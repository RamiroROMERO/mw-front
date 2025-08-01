import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'

const FooterTransfers = ({notes, onInputChange}) => {
  return (
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
    </Row>
  )
}

export default FooterTransfers