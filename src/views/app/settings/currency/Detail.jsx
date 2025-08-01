import { Checkbox } from '@Components/checkbox'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { IntlMessages } from '@Helpers/Utils'
import { Button, Card, CardBody, Row } from 'reactstrap'

const Detail = ({formState, listDecimalMark, listThousandSeparator, onInputChange, formValidation, fnSave, fnClearInputs, sendForm}) => {

  const { name, code, decimalMark, simbol, thousandSeparator, national, status } = formState;

  const { nameValid, codeValid, decimalMarkValid, simbolValid, thousandSeparatorValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" xs="6" sm="6" lg="12">
            <InputField
              value={name}
              name="name"
              label="page.currency.input.name"
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="6">
            <InputField
              value={code}
              name="code"
              label="page.currency.input.code"
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!codeValid}
              feedbackText={sendForm && (codeValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" sm="6" lg="6">
            <SimpleSelect
              name="decimalMark"
              onChange={onInputChange}
              value={decimalMark}
              label="page.currency.select.decimalMark"
              options={listDecimalMark}
              invalid={sendForm && !!decimalMarkValid}
              feedbackText={sendForm && (decimalMarkValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="6">
            <InputField
              value={simbol}
              name="simbol"
              label="page.currency.input.simbol"
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!simbolValid}
              feedbackText={sendForm && (simbolValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" sm="6" lg="6">
            <SimpleSelect
              value={thousandSeparator}
              onChange={onInputChange}
              name="thousandSeparator"
              label="page.currency.select.thousandSeparator"
              options={listThousandSeparator}
              invalid={sendForm && !!thousandSeparatorValid}
              feedbackText={sendForm && (thousandSeparatorValid || null)}
            />
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xxs="12" xs="6" sm="6" lg="6">
            <Checkbox
              onChange={onInputChange}
              name="national"
              value={national}
              label="page.currency.check.national"
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="6" className="div-content-right">
            <Checkbox
              onChange={onInputChange}
              name="status"
              value={status}
              label="check.status"
            />
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail