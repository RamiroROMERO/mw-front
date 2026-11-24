import { IntlMessages } from '@Helpers/Utils';
import { Card, CardBody, Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useTypesTaxes } from './useTypesTaxes';
import { MAX_FISCAL_CODE, MAX_NAME, USE_FLAGS } from './taxStatNameRules';

const TypesTaxes = (props) => {
  const { setLoading } = props;
  const { formState, formValidation, onInputChange, fnSave, fnClearInputs, table, propsToMsgDelete, sendForm } = useTypesTaxes({ setLoading });

  const { name, kind, isFiscal, fiscalCode, status } = formState;
  const { nameValid, kindValid, fiscalCodeValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className="mb-3">
            <CardBody>
              <Row className="mb-3">
                <Colxx xxs="12" xs="8">
                  <InputField
                    name="name"
                    onChange={onInputChange}
                    value={name}
                    label="page.typesTaxes.input.name"
                    type="text"
                    maxLength={MAX_NAME}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="kind"
                    onChange={onInputChange}
                    value={kind}
                    label="page.typesTaxes.input.kind"
                    type="text"
                    maxLength={2}
                    invalid={sendForm && !!kindValid}
                    feedbackText={sendForm && (kindValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <Checkbox name="isFiscal" onChange={onInputChange} value={isFiscal} label="page.typesTaxes.checkbox.isFiscal" />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="fiscalCode"
                    onChange={onInputChange}
                    value={fiscalCode}
                    label="page.typesTaxes.input.fiscalCode"
                    type="text"
                    maxLength={MAX_FISCAL_CODE}
                    invalid={sendForm && !!fiscalCodeValid}
                    feedbackText={sendForm && (fiscalCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <Checkbox name="status" onChange={onInputChange} value={status} label="page.typesTaxes.checkbox.status" />
                </Colxx>
              </Row>
              <Row className="mb-3">
                <Colxx xxs="12" className="mb-1"><strong>{IntlMessages('page.typesTaxes.uses.title')}</strong></Colxx>
                {USE_FLAGS.map((key) => (
                  <Colxx xxs="12" xs="6" key={key}>
                    <Checkbox name={key} onChange={onInputChange} value={formState[key]} label={`page.typesTaxes.use.${key}`} />
                  </Colxx>
                ))}
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages('button.clear')}</Button>
                  <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages('button.save')}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
};
export default TypesTaxes;
