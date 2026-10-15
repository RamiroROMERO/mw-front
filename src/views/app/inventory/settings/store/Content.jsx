import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { useStore } from './useStore';
import { MAX_NAME, MAX_DESCRIPTION, isStoreAccountRequired } from './storeRules';

const Store = (props) => {
  const { setLoading } = props;

  const { sendForm, listType, listLedgerAccounts, coffeeControl, accountingActive, errors, table, dataTable, propsToMsgDelete, formState, fnClearInputs, fnSave, onInputChange } = useStore({ setLoading });

  const { name, description, type, status, invCtaCode, costCtaCode, expenseCtaCode, fertilizerCredit } = formState;

  const storeAccountRequired = isStoreAccountRequired({ type, accountingActive });
  const showError = (field) => (sendForm && errors[field]) || null;

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="5" xl="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.store.input.nameRequired"
                      maxLength={MAX_NAME}
                      invalid={sendForm && !!errors.name}
                      feedbackText={showError('name')}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <SimpleSelect
                      name="type"
                      value={type}
                      options={listType}
                      onChange={onInputChange}
                      label="page.store.select.typeRequired"
                      invalid={sendForm && !!errors.type}
                      feedbackText={showError('type')}
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
                      label="page.store.input.description"
                      maxLength={MAX_DESCRIPTION}
                      invalid={sendForm && !!errors.description}
                      feedbackText={showError('description')}
                    />
                  </Colxx>
                </Row>
                <Row>
                  {coffeeControl && (
                    <Colxx xxs="12">
                      <Checkbox
                        onChange={onInputChange}
                        type="checkbox"
                        value={fertilizerCredit}
                        name="fertilizerCredit"
                        label="page.store.check.fertilizerCredit"
                      />
                    </Colxx>
                  )}
                  <Colxx xxs="12" align="right">
                    <Checkbox
                      onChange={onInputChange}
                      type="checkbox"
                      value={status}
                      name="status"
                      label="page.store.check.status"
                    />
                  </Colxx>
                </Row>
                {accountingActive && (
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.store.title.ledgerAccounts">
                      <Row>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label={storeAccountRequired ? 'page.store.select.storeAccountRequired' : 'page.store.select.storeAccount'}
                            name="invCtaCode"
                            inputValue={invCtaCode}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                            feedbackText={showError('invCtaCode')}
                          />
                        </Colxx>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label="page.store.select.costAccount"
                            name="costCtaCode"
                            inputValue={costCtaCode}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label="page.store.select.spentAccount"
                            name="expenseCtaCode"
                            inputValue={expenseCtaCode}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
                )}
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
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="7" xl="8">
          <ReactTable
            {...table} data={dataTable}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Store;