import { Colxx } from "@Components/common/CustomBootstrap";
import { Form, Row } from "reactstrap";
import { InputField } from "@Components/inputFields";
import DateCalendar from "@Components/dateCalendar";
import SearchSelect from "@Components/SearchSelect/SearchSelect";

const FormOrder = (props) =>{
  const {dateIn, dateOut, description, description2, idCtaCont, listLedgerAccount, onInputChange, formValidation, sendForm} = props;

  const {dateInValid, descriptionValid, idCtaContValid} = formValidation;

  return(
    <>
      <Form>
        <Row>
          <Colxx xxs="12" xs="6" md="4" lg="3">
            <DateCalendar
              value={dateIn}
              label="page.workOrders.input.dateIn"
              name="dateIn"
              onChange={onInputChange}
              invalid={sendForm && !!dateInValid}
              feedbackText={sendForm && (dateInValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="4" lg="3">
            <DateCalendar
              value={dateOut}
              label="page.workOrders.input.dateOut"
              name="dateOut"
              onChange={onInputChange}
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="4" lg="3">
            <InputField
              name="description"
              label="page.workOrders.input.nameOrder"
              value={description}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!descriptionValid}
              feedbackText={sendForm && (descriptionValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="5" lg="3">
            <SearchSelect
              label="page.workOrders.select.idCtaCont"
              name="idCtaCont"
              onChange={onInputChange}
              inputValue={idCtaCont}
              options={listLedgerAccount}
              invalid={sendForm && !!idCtaContValid}
              feedbackText={sendForm && (idCtaContValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="7" lg="6">
            <InputField
              name="description2"
              label="page.workOrders.input.description"
              value={description2}
              onChange={onInputChange}
              type="textarea"
              style={{resize: "none"}}
            />
          </Colxx>
        </Row>
      </Form>
    </>
  )
}

export default FormOrder;