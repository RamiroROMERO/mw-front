import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { ContainerWithLabel } from '@Components/containerWithLabel';

export const FooterForm = ({ formStateIndex, onInputChangeIndex, formValidationIndex, sendForm }) => {
  const { requestedBy, status } = formStateIndex;
  const { requestedByValid } = formValidationIndex;

  return (
    <Row>
      <Colxx xxs="12" sm="6" className="mb-3">
        <InputField
          name="requestedBy"
          value={requestedBy}
          onChange={onInputChangeIndex}
          label="page.checkRequest.input.requestedBy"
          type="text"
          invalid={sendForm && !!requestedByValid}
          feedbackText={sendForm && requestedByValid || null}
        />
      </Colxx>
      <Colxx xxs="12" sm="6">
        <ContainerWithLabel label="page.checkRequest.title.status">
          <InputField name="status" value={status} type="text" disabled />
        </ContainerWithLabel>
      </Colxx>
    </Row>
  );
}
