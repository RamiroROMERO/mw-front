import { IntlMessages } from "@Helpers/Utils";
import { Card, CardBody, Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { RadioGroup } from '@Components/radioGroup';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useTypesTaxes } from './useTypesTaxes';

const TypesTaxes = (props) => {
  const { setLoading } = props;
  const { formState, formValidation, onInputChange, fnSave, fnClearInputs, table, propsToMsgDelete, sendForm } = useTypesTaxes({ setLoading });

  const { name, typeGas, isFiscal, fiscalCode, status } = formState;

  const { nameValid, typeGasValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <Row className='mb-3'>
                <Colxx xxs="12" xs="8">
                  <InputField
                    name="name"
                    onChange={onInputChange}
                    value={name}
                    label="page.typesTaxes.input.name"
                    type="text"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="fiscalCode"
                    onChange={onInputChange}
                    value={fiscalCode}
                    label="page.typesTaxes.input.fiscalCode"
                    type="text"
                    maxLength={5}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8">
                  <RadioGroup
                    label="page.typesTaxes.radio.type"
                    name="typeGas"
                    value={typeGas}
                    onChange={onInputChange}
                    display="flex"
                    options={[
                      { id: 1, label: "page.typesTaxes.radio.purchase" },
                      { id: 2, label: "page.typesTaxes.radio.sale" }
                    ]}
                    invalid={sendForm && !!typeGasValid}
                    feedbackText={sendForm && (typeGasValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <Checkbox
                    name="isFiscal"
                    onChange={onInputChange}
                    value={isFiscal}
                    label="page.typesTaxes.checkbox.isFiscal"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <Checkbox
                    name="status"
                    onChange={onInputChange}
                    value={status}
                    label="page.typesTaxes.checkbox.status"
                  />
                </Colxx>
              </Row>
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
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TypesTaxes;
