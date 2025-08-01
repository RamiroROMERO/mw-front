import React from 'react';
import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import { SimpleSelect } from '@/components/simpleSelect';
import ReactTable from '@/components/reactTable';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { useStore } from './useStore';

const Store = (props) => {
  const { setLoading } = props;

  const { sendForm, listType, listLedgerAccounts, table, dataTable, propsToMsgDelete, formState, formValidation, fnClearInputs, fnSave, onInputChange } = useStore({ setLoading });

  const { name, description, type, status, idCtaInventory, idCtaCost, idCtaExpense } = formState;

  const { nameValid } = formValidation;

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
                      label="page.store.input.name"
                      invalid={sendForm && !!nameValid}
                      feedbackText={sendForm && (nameValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <SimpleSelect
                      name="type"
                      value={type}
                      options={listType}
                      onChange={onInputChange}
                      label="page.store.select.type"
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
                    />
                  </Colxx>
                </Row>
                <Row>
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
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.store.title.ledgerAccounts">
                      <Row>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label="page.store.select.storeAccount"
                            name="idCtaInventory"
                            inputValue={idCtaInventory}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                          />
                        </Colxx>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label="page.store.select.costAccount"
                            name="idCtaCost"
                            inputValue={idCtaCost}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx sm="12" md={6} lg="12">
                          <SearchSelect
                            label="page.store.select.spentAccount"
                            name="idCtaExpense"
                            inputValue={idCtaExpense}
                            options={listLedgerAccounts}
                            onChange={onInputChange}
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
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