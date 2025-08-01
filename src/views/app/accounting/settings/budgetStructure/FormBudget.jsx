import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { SimpleSelect } from '@/components/simpleSelect'
import { ContainerWithLabel } from '@/components/containerWithLabel'

const FormBudget = ({formState, onInputChange}) => {
  const {yearNo, orderId, name, type, action, month1, month2, month3, month4, month5, month6, month7, month8, month9, month10, month11, month12} = formState;

  return (
    <Row>
      <Colxx xxs="12" lg="7">
        <Row>
          <Colxx xxs="12" xs="3">
            <InputField
              name="orderId"
              label='page.budgetStructure.input.orderId'
              value={orderId}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="9">
            <InputField
              name="name"
              label='input.description'
              value={name}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="4" sm="3">
            <InputField
              name="yearNo"
              label='page.budgetStructure.input.yearNo'
              value={yearNo}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="8" sm="5">
            <SimpleSelect
              name="type"
              value={type}
              label="select.type"
              onChange={onInputChange}
              options={[
                {id:"Titulo", name:"Titulo"},
                {id:"Detalle", name:"Detalle"},
                {id:"Total", name:"Total"},
                {id:"Acumulado", name:"Acumulado"}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <SimpleSelect
              name="action"
              value={action}
              label="select.action"
              onChange={onInputChange}
              options={[
                {id:"Ninguno", name:"Ninguno"},
                {id:"Suma", name:"Suma"},
                {id:"Resta", name:"Resta"}
              ]}
            />
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.budgetStructure.label.detail">
              <Row>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month1"
                    label='page.budgetStructure.input.month1'
                    value={month1}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month2"
                    label='page.budgetStructure.input.month2'
                    value={month2}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month3"
                    label='page.budgetStructure.input.month3'
                    value={month3}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month4"
                    label='page.budgetStructure.input.month4'
                    value={month4}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month5"
                    label='page.budgetStructure.input.month5'
                    value={month5}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month6"
                    label='page.budgetStructure.input.month6'
                    value={month6}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month7"
                    label='page.budgetStructure.input.month7'
                    value={month7}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month8"
                    label='page.budgetStructure.input.month8'
                    value={month8}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month9"
                    label='page.budgetStructure.input.month9'
                    value={month9}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month10"
                    label='page.budgetStructure.input.month10'
                    value={month10}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month11"
                    label='page.budgetStructure.input.month11'
                    value={month11}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" md="3" lg="4" xl="3">
                  <InputField
                    name="month12"
                    label='page.budgetStructure.input.month12'
                    value={month12}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormBudget