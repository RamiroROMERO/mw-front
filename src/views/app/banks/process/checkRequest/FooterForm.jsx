import { Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from "@Components/inputFields";
import { formatNumber } from '@Helpers/Utils';
import { ContainerWithLabel } from "@Components/containerWithLabel";
import DateCalendar from '@Components/dateCalendar';

export const FooterForm = ({ formStateIndex, onInputChangeIndex, formValidationIndex, sendForm }) => {

  const { requestorId, state, numberId, dateState } = formStateIndex;

  const { requestorIdValid } = formValidationIndex;
  return (
    <Row>
      <Colxx xs="12">
        <Row className="mb-3">
          <Colxx xs="12" xss="6" md="6" lg="6">
            <InputField
              name="requestorId"
              value={requestorId}
              onChange={onInputChangeIndex}
              label="input.requestorId"
              invalid={sendForm && !!requestorIdValid}
              feedbackText={sendForm && requestorIdValid || null}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xs="12">
        <ContainerWithLabel label="page.checkRequest.title.status">
          <Row>
            <Colxx xss="12" xs="6" md="4" lg="4" >
              <InputField
                name="state"
                value={state}
                onChange={onInputChangeIndex}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xss="12" xs="6" md="4" lg="4" >
              <InputField
                name="numberId"
                value={numberId}
                onChange={onInputChangeIndex}
                label="page.checkRequest.input.numberId"
                type="text"
              />
            </Colxx>
            <Colxx xss="12" xs="6" md="4" lg="4">
              <DateCalendar
                name="dateState"
                value={dateState}
                label="input.date"
                onChange={onInputChangeIndex}
                disabled
              />
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}
