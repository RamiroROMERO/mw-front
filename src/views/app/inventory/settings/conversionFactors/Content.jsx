import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useConversionFactors } from './useConversionFactors';
import { MAX_FACTOR_LENGTH } from './conversionFactorRules';

const ConversionFactors = (props) => {
  const { setLoading } = props;

  const {formState, errors, sendForm, table, propsToMsgDelete, listMUnits, onInputChange, fnClearInputs, fnSave, fnBulkAddAll} = useConversionFactors({setLoading});

  const { inputUnitCode, outputUnitCode, valueFactor, status } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <SearchSelect
                      label="page.conversionFactors.select.inputUnitRequired"
                      name="inputUnitCode"
                      inputValue={inputUnitCode}
                      options={listMUnits}
                      onChange={onInputChange}
                      invalid={sendForm && !!errors.inputUnitCode}
                      feedbackText={showError('inputUnitCode')}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <SearchSelect
                      label="page.conversionFactors.select.outputUnitRequired"
                      name="outputUnitCode"
                      options={listMUnits}
                      inputValue={outputUnitCode}
                      onChange={onInputChange}
                      invalid={sendForm && !!errors.outputUnitCode}
                      feedbackText={showError('outputUnitCode')}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={valueFactor}
                      name="valueFactor"
                      onChange={onInputChange}
                      type="text"
                      label="page.conversionFactors.input.valueFactorRequired"
                      maxLength={MAX_FACTOR_LENGTH}
                      invalid={sendForm && !!errors.valueFactor}
                      feedbackText={showError('valueFactor')}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.conversionFactors.check.status"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" align="right">
                    <Button color="secondary" onClick={fnClearInputs} className="me-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="8">
          <Row className="mb-2">
            <Colxx xxs="12" className="div-action-button-container">
              <Button color="secondary" onClick={fnBulkAddAll}>
                <i className="simple-icon-plus" /> {IntlMessages("page.conversionFactors.button.addAll")}
              </Button>
            </Colxx>
          </Row>
          <ReactTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
      </Row>
    </>
  );
}
export default ConversionFactors;