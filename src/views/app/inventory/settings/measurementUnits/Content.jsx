import { Card, CardBody, Row, Form, Button } from 'reactstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import { useMeasurementUnits } from './useMeasurementUnits';

const MeasurementUnits = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, sendForm, table, propsToMsgDelete, onInputChange, fnClearInputs, fnSave } = useMeasurementUnits({ setLoading });

  const { id, code, name, description, type, status } = formState;

  const { codeValid, nameValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={code}
                      name="code"
                      onChange={onInputChange}
                      type="text"
                      label="page.measurementUnits.input.code"
                      invalid={sendForm && !!codeValid}
                      feedbackText={sendForm && (codeValid || null)}
                      disabled={validInt(id) === 0 ? false : true}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.measurementUnits.input.name"
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
                      type="textarea"
                      label="page.measurementUnits.input.description"
                    />
                  </Colxx>
                </Row>
                <Row className='mb-3'>
                  <Colxx xxs="12" sm="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="type"
                      value={type}
                      label="page.measurementUnits.check.presentation"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.measurementUnits.check.status"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" className="div-action-button-container">
                    <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="8">
          <ReactTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
      </Row>
    </>
  );
}
export default MeasurementUnits;