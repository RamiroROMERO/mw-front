import React from 'react';
import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import ReactTable from '@/components/reactTable';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import useDiscounts from './useDiscounts';
import useTableConf from './useTableConf';

const Discounts = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, sendForm, onInputChange, listLedgerAccount, fnSave, propsToMsgDelete, tableData, fnClearInputs, fnEditItem, fnDeleteItem } = useDiscounts({ setLoading });

  const { id, name, percentValue, idCtaAccount, status } = formState;
  const { nameValid, percentValueValid, idCtaAccountValid } = formValidation;
  const { tableInfo } = useTableConf(tableData, fnEditItem, fnDeleteItem);

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6" className="mb-3">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12" sm="8" lg="12">
                  <InputField
                    value={name}
                    name='name'
                    type='text'
                    onChange={onInputChange}
                    label="page.discounts.input.description"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="4" lg="4">
                  <InputField
                    value={percentValue}
                    name='percentValue'
                    type='text'
                    label="page.discounts.input.amount"
                    onChange={onInputChange}
                    invalid={sendForm && !!percentValueValid}
                    feedbackText={sendForm && (percentValueValid || null)}
                  />
                </Colxx>
                <Colxx sm="12" lg="8">
                  <SearchSelect
                    label='page.discounts.select.account'
                    name='idCtaAccount'
                    inputValue={idCtaAccount}
                    options={listLedgerAccount}
                    onChange={onInputChange}
                    invalid={sendForm && !!idCtaAccountValid}
                    feedbackText={sendForm && (idCtaAccountValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx sm={12}>
                  <Checkbox
                    label="page.cashBoxes.check.active"
                    name="status"
                    value={status}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <hr />
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                  <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...tableInfo}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Discounts;