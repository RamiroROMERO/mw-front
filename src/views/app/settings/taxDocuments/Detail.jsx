import { Checkbox } from '@Components/checkbox'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import DateCalendar from '@Components/dateCalendar'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { IntlMessages } from '@Helpers/Utils'
// import ReactInputMask from 'react-input-mask'
import { Button, Card, CardBody, Row } from 'reactstrap'

const Detail = ({ formState, listCompany, onInputChange, formValidation, fnSave, fnClearInputs, sendForm }) => {

  const { name, description, companyId, cai1, cai2, cai3, cai4, cai5, cai6, ndoc1, ndoc2, ndoc3, ndoc4, limitDate, noRange, minDoctos, status } = formState;

  const { nameValid, descriptionValid, companyIdValid, cai1Valid, cai2Valid, cai3Valid, cai4Valid, cai5Valid, cai6Valid,
    ndoc1Valid, ndoc2Valid, ndoc3Valid, ndoc4Valid, limitDateValid, noRangeValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={name}
              name="name"
              onChange={onInputChange}
              type="text"
              label="page.taxDocument.input.name"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={description}
              name="description"
              onChange={onInputChange}
              type="text"
              label="page.taxDocument.input.description"
              invalid={sendForm && !!descriptionValid}
              feedbackText={sendForm && (descriptionValid || null)}
            />
          </Colxx>
          <Colxx xss="12">
            <SearchSelect
              label="page.taxDocument.select.companyId"
              name="companyId"
              inputValue={companyId}
              onChange={onInputChange}
              options={listCompany}
              invalid={sendForm && !!companyIdValid}
              feedbackText={sendForm && (companyIdValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.taxDocument.input.cai1">
              <Row>
                <Colxx xxs="6" xs="4" sm="3" lg="4">
                  <InputField
                    value={cai1}
                    name="cai1"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai1Valid}
                    feedbackText={sendForm && (cai1Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" lg="4">
                  <InputField
                    value={cai2}
                    name="cai2"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai2Valid}
                    feedbackText={sendForm && (cai2Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" lg="4">
                  <InputField
                    value={cai3}
                    name="cai3"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai3Valid}
                    feedbackText={sendForm && (cai3Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" lg="4">
                  <InputField
                    value={cai4}
                    name="cai4"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai4Valid}
                    feedbackText={sendForm && (cai4Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" lg="4">
                  <InputField
                    value={cai5}
                    name="cai5"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai5Valid}
                    feedbackText={sendForm && (cai5Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="3" sm="2" lg="3">
                  <InputField
                    value={cai6}
                    name="cai6"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!cai6Valid}
                    feedbackText={sendForm && (cai6Valid || null)}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.taxDocument.input.correlative">
              <Row>
                <Colxx xxs="6" xs="4" sm="3" lg="3">
                  <InputField
                    value={ndoc1}
                    name="ndoc1"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!ndoc1Valid}
                    feedbackText={sendForm && (ndoc1Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="3" lg="3">
                  <InputField
                    value={ndoc2}
                    name="ndoc2"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!ndoc2Valid}
                    feedbackText={sendForm && (ndoc2Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="2" lg="2">
                  <InputField
                    value={ndoc3}
                    name="ndoc3"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!ndoc3Valid}
                    feedbackText={sendForm && (ndoc3Valid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" xs="4" sm="4" lg="4">
                  <InputField
                    value={ndoc4}
                    name="ndoc4"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!ndoc4Valid}
                    feedbackText={sendForm && (ndoc4Valid || null)}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xss="12" xs="6" sm="6" lg="6">
            <DateCalendar
              name="limitDate"
              value={limitDate}
              label="page.taxDocument.input.limitDate"
              onChange={onInputChange}
              invalid={sendForm && !!limitDateValid}
              feedbackText={sendForm && (limitDateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="6">
            <InputField
              value={minDoctos}
              name="minDoctos"
              onChange={onInputChange}
              type="text"
              label="page.taxDocument.input.minDoctos"
            />
          </Colxx>
          <Colxx xxs="12" xs="12" sm="12" lg="12">
            <InputField
              value={noRange}
              name="noRange"
              onChange={onInputChange}
              type="text"
              label="page.taxDocument.input.noRange"
              invalid={sendForm && !!noRangeValid}
              feedbackText={sendForm && (noRangeValid || null)}
              mask="***-***-**-******** Al ***-***-**-********"
              maskChar=" "
            // tag={ReactInputMask}
            />
          </Colxx>
          <Colxx xxs="12" className="div-content-right">
            <Checkbox
              onChange={onInputChange}
              name="status"
              value={status}
              label="page.companyInformation.check.status"
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