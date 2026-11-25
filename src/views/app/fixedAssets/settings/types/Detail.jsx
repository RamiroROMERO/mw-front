import { Button, Card, CardBody, Row } from 'reactstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { Checkbox } from '@Components/checkbox'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { RadioGroup } from '@Components/radioGroup'
import { IntlMessages } from '@Helpers/Utils'

export const Detail = ({formState, accountList, onInputChange, formValidation, fnSave, fnClear, sendForm}) => {

  const {id, code,  name, userLife, currentCode, residualValue, depreciationTypeId, depreciationCtaCode, costCtaCode, status} = formState;

  const {codeValid, nameValid, userLifeValid, depreciationTypeIdValid, residualValueValid, depreciationCtaCodeValid, costCtaCodeValid} = formValidation;

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
          maxLength={4}
          disabled={Number(id) > 0}
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
          maxLength={50}
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
          options={[{id:'1', label:'page.fixedAssets.radio.straightLine'}]}
          invalid={sendForm && !!depreciationTypeIdValid}
          feedbackText={sendForm && (depreciationTypeIdValid || null)}
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs={12} sm={6} md={12}>
        <SearchSelect
          name="depreciationCtaCode"
          label="page.fixedAssets.input.accDeprecation"
          onChange={onInputChange}
          inputValue={depreciationCtaCode}
          options={accountList}
          invalid={sendForm && !!depreciationCtaCodeValid}
          feedbackText={sendForm && (depreciationCtaCodeValid || null)}
        />
      </Colxx>
      <Colxx xxs={12} sm={6} md={12}>
        <SearchSelect
          name="costCtaCode"
          label="page.fixedAssets.input.accCost"
          onChange={onInputChange}
          inputValue={costCtaCode}
          options={accountList}
          invalid={sendForm && !!costCtaCodeValid}
          feedbackText={sendForm && (costCtaCodeValid || null)}
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
