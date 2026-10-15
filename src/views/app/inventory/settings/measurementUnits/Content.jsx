import { Card, CardBody, Row, Form, Button } from 'reactstrap';
import { IntlMessages, validInt } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { useMeasurementUnits } from './useMeasurementUnits';
import { MAX_CODE, MAX_NAME, MAX_DESCRIPTION } from './measurementUnitRules';

const MeasurementUnits = (props) => {
  const { setLoading } = props;

  const { formState, errors, sendForm, table, propsToMsgDelete, containerControl, onInputChange, fnClearInputs, fnSave } = useMeasurementUnits({ setLoading });

  const { id, code, name, description, isPackaging, baseConversion, containerUse, status } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  // El código va en mayúsculas (el legacy lo forzaba con Format "!").
  const onCodeChange = ({ target }) => onInputChange({ target: { name: 'code', value: String(target.value).toUpperCase() } });

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
                      onChange={onCodeChange}
                      type="text"
                      label="page.measurementUnits.input.codeRequired"
                      maxLength={MAX_CODE}
                      invalid={sendForm && !!errors.code}
                      feedbackText={showError('code')}
                      disabled={validInt(id) === 0 ? false : true}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.measurementUnits.input.nameRequired"
                      maxLength={MAX_NAME}
                      invalid={sendForm && !!errors.name}
                      feedbackText={showError('name')}
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
                      maxLength={MAX_DESCRIPTION}
                      invalid={sendForm && !!errors.description}
                      feedbackText={showError('description')}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={baseConversion}
                      name="baseConversion"
                      onChange={onInputChange}
                      type="number"
                      min="0"
                      step="1"
                      label="page.measurementUnits.input.quantity"
                      invalid={sendForm && !!errors.baseConversion}
                      feedbackText={showError('baseConversion')}
                    />
                  </Colxx>
                </Row>
                <Row className='mb-3'>
                  <Colxx xxs="12" sm="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="isPackaging"
                      value={isPackaging}
                      label="page.measurementUnits.check.presentation"
                    />
                  </Colxx>
                  {containerControl && (
                    <Colxx xxs="12" sm="6" lg="12">
                      <Checkbox
                        onChange={onInputChange}
                        name="containerUse"
                        value={containerUse}
                        label="page.measurementUnits.check.containerUse"
                      />
                    </Colxx>
                  )}
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