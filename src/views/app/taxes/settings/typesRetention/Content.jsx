import React from 'react';
import { IntlMessages } from "@/helpers/Utils";
import { Card, CardBody, Button, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import ReactTable from '@/components/reactTable';
import Confirmation from '@/containers/ui/confirmationMsg';
import { useTypeRetentions } from './useTypeRetentions';

const TypesRetention = (props) => {
  const { setLoading } = props;
  const { formState, formValidation, onInputChange, fnSave, fnClearInputs, table, propsToMsgDelete, sendForm, listAccount } = useTypeRetentions({ setLoading });

  const { id, name, status, value, taxCode, idCtaAccount } = formState;

  const { nameValid, valueValid, taxCodeValid, idCtaAccountValid } = formValidation;

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
                    label="page.typesRetention.input.name"
                    type="text"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="value"
                    onChange={onInputChange}
                    value={value}
                    label="page.typesRetention.input.value"
                    type="text"
                    invalid={sendForm && !!valueValid}
                    feedbackText={sendForm && (valueValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8">
                  <SearchSelect
                    label="page.typesRetention.select.idCtaAccount"
                    name="idCtaAccount"
                    onChange={onInputChange}
                    inputValue={idCtaAccount}
                    options={listAccount}
                    invalid={sendForm && !!idCtaAccountValid}
                    feedbackText={sendForm && (idCtaAccountValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="taxCode"
                    onChange={onInputChange}
                    value={taxCode}
                    label="page.typesRetention.input.taxCode"
                    type="text"
                    invalid={sendForm && !!taxCodeValid}
                    feedbackText={sendForm && (taxCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <Checkbox
                    name="status"
                    onChange={onInputChange}
                    value={status}
                    label="page.typesRetention.checkbox.status"
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
export default TypesRetention;