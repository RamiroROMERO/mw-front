import { Checkbox } from '@Components/checkbox';
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';
import { Button, Card, CardBody, Row } from 'reactstrap'

const Detail = ({formState, onInputChange, formValidation, fnSave, fnClearInputs, fnViewDetail, sendForm}) => {

  const { name, usageType, usageCriteria, isDefault } = formState;
  const { nameValid, usageTypeValid, usageCriteriaValid } = formValidation;

  return (
    <Card>
      <CardBody>
        <Row>
          <Colxx xxs="12" xs="6" sm="6" lg="12">
            <InputField
              value={name}
              name="name"
              onChange={onInputChange}
              type="text"
              label="page.paymentMethods.input.name"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xss="12" xs="12" sm="6" lg="6">
            <RadioGroup
              label='page.paymentMethods.title.critUsage'
              name='usageCriteria'
              value={usageCriteria}
              onChange={onInputChange}
              options={[
                { id: 1, label: 'page.paymentMethods.radio.usageCriteria.cashPayment' },
                { id: 2, label: 'page.paymentMethods.radio.usageCriteria.creditCard' },
                { id: 3, label: 'page.paymentMethods.radio.usageCriteria.receivable' },
                { id: 4, label: 'page.paymentMethods.radio.usageCriteria.useInsurers' },
                { id: 5, label: 'page.paymentMethods.radio.usageCriteria.checks' },
                { id: 6, label: 'page.paymentMethods.radio.usageCriteria.accountsPayable' }
              ]}
              invalid={sendForm && !!usageCriteriaValid}
              feedbackText={sendForm && (usageCriteriaValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="6">
            <RadioGroup
              label='page.paymentMethods.title.tipeUsage'
              name='usageType'
              value={usageType}
              onChange={onInputChange}
              options={[
                { id: 1, label: 'page.paymentMethods.radio.usageType.customers' },
                { id: 2, label: 'page.paymentMethods.radio.usageType.providers' },
                { id: 3, label: 'page.paymentMethods.radio.usageType.bothCases' }
              ]}
              invalid={sendForm && !!usageTypeValid}
              feedbackText={sendForm && (usageTypeValid || null)}
            />
            <Button className='btn btn-info' onClick={fnViewDetail} >{IntlMessages("button.detail")} </Button>
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xxs="12" xs="12" >
            <Checkbox
              label="page.paymentMethods.check.predetermined"
              name="isDefault"
              value={isDefault}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
            <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail