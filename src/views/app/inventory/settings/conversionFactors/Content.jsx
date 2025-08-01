import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { useConversionFactors } from './useConversionFactors';

const ConversionFactors = (props) => {
  const { setLoading } = props;

  const {formState, formValidation, sendForm, table, propsToMsgDelete, listMUnits, onInputChange, fnClearInputs, fnSave} = useConversionFactors({setLoading});

  const { inputUnit, outputUnit, valueFactor, status } = formState;

  const { inputUnitValid, outputUnitValid, valueFactorValid } = formValidation;

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
                      label="page.conversionFactors.select.inputUnit"
                      name="inputUnit"
                      inputValue={inputUnit}
                      options={listMUnits}
                      onChange={onInputChange}
                      invalid={sendForm && !!inputUnitValid}
                      feedbackText={sendForm && (inputUnitValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <SearchSelect
                      label="page.conversionFactors.select.outputUnit"
                      name="outputUnit"
                      options={listMUnits}
                      inputValue={outputUnit}
                      onChange={onInputChange}
                      invalid={sendForm && !!outputUnitValid}
                      feedbackText={sendForm && (outputUnitValid || null)}
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
                      label="page.conversionFactors.input.valueFactor"
                      invalid={sendForm && !!valueFactorValid}
                      feedbackText={sendForm && (valueFactorValid || null)}
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
                    <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
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
export default ConversionFactors;