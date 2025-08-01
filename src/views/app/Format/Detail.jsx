import React from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { Checkbox } from '@/components/checkbox'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import { IntlMessages } from '@/helpers/Utils'
import { SimpleSelect } from '@/components/simpleSelect'

export const Detail = ({formState, accountList, onInputChange, onCompanyChange, formValidation, fnSave, fnClear, sendForm}) => {

  const {companyId, name, accDepreciation, accCost, status} = formState;

  const {companyIdValid, nameValid, accDepreciationValid, accCostValid} = formValidation;

  return (
    <>
    <Card>
      <CardBody>
    <Row>
      <Colxx xxs={9} md={6}>
        <SimpleSelect 
          name="companyId"
          value={companyId}
          onChange={onCompanyChange}
          options={accountList}
          invalid={sendForm && !!companyIdValid}
          feedbackText={sendForm && (companyIdValid || null)}
        />
      </Colxx>
      <Colxx xxs={3} md={6} align="right">
        <Checkbox 
          name="status"
          label="check.status"
          value={status}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs={12}>
        <InputField 
          name="name"
          label="input.name"
          onChange={onInputChange}
          value={name}
          invalid={sendForm && !!nameValid}
          feedbackText={sendForm && (nameValid || null)}
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs={12} sm={6} md={12}>
        <SearchSelect
          name="accDepreciation"
          label="page.fixedAssets.input.accDeprecation"
          onChange={onInputChange}
          inputValue={accDepreciation}
          options={accountList}
        />
      </Colxx>
      <Colxx xxs={12} sm={6} md={12}>
        <SearchSelect
          name="accCost"
          label="page.fixedAssets.input.accCost"
          onChange={onInputChange}
          inputValue={accCost}
          options={accountList}
        />
      </Colxx>
    </Row>
    <hr />
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button
          color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
        </Button>
        <Button
          color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
      </Colxx>
      </Row>
    </CardBody>
    </Card>
    </>
  )
}
