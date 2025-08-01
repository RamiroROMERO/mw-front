import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'

const FooterReport = ({formState, onInputChange}) => {
  const {notes, createdBy, reviewedBy, total} = formState;
  return (
    <Row>
      <Colxx className="order-xs-2 order-lg-1" xxs="12" md="12" lg="7">
        <InputField
          name="notes"
          label='input.observations'
          value={notes}
          onChange={onInputChange}
          type="textarea"
        />
      </Colxx>
      <Colxx className="order-xs-3 order-lg-2" xxs="12" md="12" lg="3">
        <Row>
          <Colxx xxs="12" sm="6" lg="12">
            <InputField
              name="createdBy"
              label='page.purchaseMemo.input.createdBy'
              value={createdBy}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
            <InputField
              name="reviewedBy"
              label='page.purchaseMemo.input.reviewedBy'
              value={reviewedBy}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx className="order-xs-1 order-lg-3" xxs="12" xs="4" md="3" lg="2">
        <InputField
          name="total"
          label='input.total'
          value={total}
          onChange={onInputChange}
          type="text"
          disabled
        />
      </Colxx>
    </Row>
  )
}

export default FooterReport