import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { Checkbox } from '@/components/checkbox'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import { IntlMessages } from '@/helpers/Utils'

export const Detail = ({formState, accountList, onInputChange, formValidation, fnSave, fnClear, sendForm}) => {

  const {code,  name, userLife, currentCode, residualValue, depreciationTypeId, accDepreciation, accCost, status} = formState;

  const {codeValid, nameValid, userLifeValid, depreciationTypeIdValid, residualValueValid} = formValidation;

  return (
    <>
    <Card>
      <CardBody>
    <Row>
      <Colxx xxs={4} md={3}>
        <InputField
          name="code"
          label="input.code"
          onChange = {onInputChange}
          value={code}
          invalid={sendForm && !!codeValid}
          feedbackText={sendForm && (codeValid || null)}
        />
      </Colxx>
      <Colxx xxs={4} md={3}>
        <InputField
          name="currentCode"
          label="pages.fixedAssets.input.currentCode"
          onChange = {onInputChange}
          value={currentCode}
          disabled
        />
      </Colxx>
      <Colxx xxs={4} md={6} align="right">
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
      <Colxx xxs={6} sm={6} >
        <InputField
          name="userLife"
          label="page.fixedAssets.input.userLife"
          onChange={onInputChange}
          value={userLife}
          invalid={sendForm && !!userLifeValid}
          feedbackText={sendForm && (userLifeValid || null)}
        />
      </Colxx>
      <Colxx xxs={6} sm={6}>
        <InputField
          name="residualValue"
          label="page.fixedAssets.input.residualValuePercent"
          onChange={onInputChange}
          value={residualValue}
          invalid={sendForm && !!residualValueValid}
          feedbackText={sendForm && (residualValueValid || null)}
        />
      </Colxx>
      <Colxx xxs={12}>
        <RadioGroup 
          name="depreciationTypeId"
          label="page.fixedAssets.input.depreciationTypeId"
          onChange={onInputChange}
          value={depreciationTypeId}
          options={[{id:'1', label:'page.fixedAssets.radio.straightLine'}, {id:2, label:'page.fixedAssets.radio.unitProduced'}]}
          invalid={sendForm && !!depreciationTypeIdValid}
          feedbackText={sendForm && (depreciationTypeIdValid || null)}
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
