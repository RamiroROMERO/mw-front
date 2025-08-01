import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { Checkbox } from '@Components/checkbox'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import { Button, Card, CardBody, Row } from 'reactstrap'

export const Detail = ({formState, listAccount, onInputChange, formValidation, fnSave, fnClearInputs, sendForm}) => {

  const { name, status, descrip, isCash, idCtaIng, idCtaCxp, idCtaDesc, idCtaBon, idCtaIva, idCtaFlete, idCtaOther } = formState;

  const { nameValid, idCtaIngValid, idCtaCxpValid, idCtaDescValid, idCtaIvaValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="name"
              label="page.customerTypes.input.name"
              onChange={onInputChange}
              type="text"
              value={name}
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="descrip"
              label="page.customerTypes.input.descrip"
              onChange={onInputChange}
              type="textarea"
              value={descrip}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaIng"
              name="idCtaIng"
              inputValue={idCtaIng}
              onChange={onInputChange}
              options={listAccount}
              invalid={sendForm && !!idCtaIngValid}
              feedbackText={sendForm && (idCtaIngValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaCxp"
              name="idCtaCxp"
              inputValue={idCtaCxp}
              onChange={onInputChange}
              options={listAccount}
              invalid={sendForm && !!idCtaCxpValid}
              feedbackText={sendForm && (idCtaCxpValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaDesc"
              name="idCtaDesc"
              inputValue={idCtaDesc}
              onChange={onInputChange}
              options={listAccount}
              invalid={sendForm && !!idCtaDescValid}
              feedbackText={sendForm && (idCtaDescValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaIva"
              name="idCtaIva"
              inputValue={idCtaIva}
              onChange={onInputChange}
              options={listAccount}
              invalid={sendForm && !!idCtaIvaValid}
              feedbackText={sendForm && (idCtaIvaValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaFlete"
              name="idCtaFlete"
              inputValue={idCtaFlete}
              onChange={onInputChange}
              options={listAccount}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaBon"
              name="idCtaBon"
              inputValue={idCtaBon}
              onChange={onInputChange}
              options={listAccount}
            />
          </Colxx>
          <Colxx xss="12" xs="12" sm="6" lg="12">
            <SearchSelect
              label="page.customerTypes.select.idCtaOther"
              name="idCtaOther"
              inputValue={idCtaOther}
              onChange={onInputChange}
              options={listAccount}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="7">
            <Checkbox
              name="isCash"
              label="page.customerTypes.checkbox.isCash"
              onChange={onInputChange}
              value={isCash}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="2" lg="5" className='div-content-right'>
            <Checkbox
              name="status"
              value={status}
              onChange={onInputChange}
              label="page.customerTypes.checkbox.status"
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
