import { Card, CardBody, Row, Form, Button } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { Checkbox } from '@Components/checkbox';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { useLittleCashFunds } from './useLittleCashFunds';

const LittleCashFunds = ({ setLoading }) => {
  const { formState, formValidation, sendForm, table, propsToMsgDelete, listAccount, onInputChange, fnClearInputs, fnSave } = useLittleCashFunds({ setLoading });

  const { code, name, codeInt, valuePayment, numberAccount, status } = formState;
  const { nameValid, codeValid, numberAccountValid } = formValidation;

  return (
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
                    label="page.littleCashFunds.input.code"
                    invalid={sendForm && !!codeValid}
                    feedbackText={sendForm && (codeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.littleCashFunds.input.name"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={codeInt}
                    name="codeInt"
                    onChange={onInputChange}
                    type="text"
                    label="page.littleCashFunds.input.codeInt"
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={valuePayment}
                    name="valuePayment"
                    onChange={onInputChange}
                    type="text"
                    label="page.littleCashFunds.input.valuePayment"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <SearchSelect
                    name="numberAccount"
                    inputValue={numberAccount}
                    onChange={onInputChange}
                    label="page.littleCashFunds.select.numberAccount"
                    options={listAccount}
                    invalid={sendForm && !!numberAccountValid}
                    feedbackText={sendForm && numberAccountValid || null}
                  />
                </Colxx>
              </Row>
              <Row className='mb-3'>
                <Colxx xxs="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="status"
                    value={status}
                    label="page.littleCashFunds.check.status"
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
        <ReactTable {...table} />
      </Colxx>
      <Confirmation {...propsToMsgDelete} />
    </Row>
  );
}
export default LittleCashFunds;
