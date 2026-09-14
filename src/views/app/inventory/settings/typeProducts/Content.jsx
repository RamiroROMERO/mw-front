import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages, validInt } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import { useTypeProducts } from './useTypeProducts';

const TypeProducts = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, sendForm, table, propsToMsgDelete, listLedgerAccount, onInputChange, fnClearInputs, fnSave } = useTypeProducts({ setLoading });

  const { id, name, description, codeInit, codeSeq, inventoryAccount, costAccount, expenseAccount, incomeAccount, status } = formState;

  const { nameValid, codeInitValid } = formValidation;
  // El legacy deshabilita ambos campos una vez que el registro ya existe (Grid1.DblClick),
  // para que el prefijo de código interno no cambie después de generarse productos con él.
  const codeLocked = validInt(id) > 0;

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" md="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.typeProducts.input.name"
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
                      label="page.typeProducts.input.description"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="6">
                    <InputField
                      value={codeInit}
                      name="codeInit"
                      onChange={onInputChange}
                      disabled={codeLocked}
                      type="text"
                      label="page.typeProducts.input.codeInit"
                      invalid={sendForm && !!codeInitValid}
                      feedbackText={sendForm && (codeInitValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="6">
                    <InputField
                      value={codeSeq}
                      name="codeSeq"
                      onChange={onInputChange}
                      disabled={codeLocked}
                      type="text"
                      label="page.typeProducts.input.codeSeq"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <span className="text-muted small">{IntlMessages("page.typeProducts.title.accounts")}</span>
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="12">
                    <SearchSelect
                      label="page.typeProducts.select.inventoryAccount"
                      name="inventoryAccount"
                      inputValue={inventoryAccount}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="12">
                    <SearchSelect
                      label="page.typeProducts.select.costAccount"
                      name="costAccount"
                      inputValue={costAccount}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="12">
                    <SearchSelect
                      label="page.typeProducts.select.expenseAccount"
                      name="expenseAccount"
                      inputValue={expenseAccount}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="12">
                    <SearchSelect
                      label="page.typeProducts.select.incomeAccount"
                      name="incomeAccount"
                      inputValue={incomeAccount}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" md="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.typeProducts.check.status"
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
export default TypeProducts;