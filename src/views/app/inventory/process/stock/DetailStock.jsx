import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Row } from 'reactstrap';

const DetailStock = ({currentExistence, totalInputs, totalOutputs, maximumCost, minimumCost, averageCost, currentCost, onInputChange}) => {

  return (
    <Row>
      <Colxx xxs="12" xs="6">
        <Row>
          <Colxx xxs="12">
            <InputField
              name="maximumCost"
              label='input.maximumCost'
              value={maximumCost}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="minimumCost"
              label='input.minimumCost'
              value={minimumCost}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="averageCost"
              label='input.averageCost'
              value={averageCost}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" xs="6">
        <Row>
          <Colxx xxs="12">
            <InputField
              name="currentExistence"
              label='input.currentExistence'
              value={currentExistence}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="totalInputs"
              label='input.totalInputs'
              value={totalInputs}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="totalOutputs"
              label='input.totalOutputs'
              value={totalOutputs}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="currentCost"
              label='input.currentCost'
              value={currentCost}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default DetailStock