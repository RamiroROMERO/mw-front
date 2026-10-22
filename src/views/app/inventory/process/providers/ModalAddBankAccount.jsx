import { useMemo, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import { SimpleSelect } from "@Components/simpleSelect";
import { InputField } from "@Components/inputFields";
import { Checkbox } from "@Components/checkbox";
import { request } from '@Helpers/core';
import { useForm } from "@Hooks";
import {
  validateBankAccount, buildBankAccountPayload, ACCOUNT_TYPE_OPTIONS, CLASSIFICATION_OPTIONS,
  ACCOUNT_NUMBER_MAX, BENEFICIARY_MAX, BENEFICIARY_DNI_MAX, BENEFICIARY_EMAIL_MAX
} from "./providerRules";

const ModalAddBankAccount = (props) => {
  const { data, setOpen } = props;
  const { currentItem, setLoading, listBanks, fnGetBankAccounts, providerId } = data;
  const [sendForm, setSendForm] = useState(false);

  const { formState, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    isExterior: currentItem.isExterior ? currentItem.isExterior : false,
    status: currentItem.status ? currentItem.status : true,
    bankName: currentItem.bankName ? currentItem.bankName : '',
    typeCtaName: currentItem.typeCtaName ? currentItem.typeCtaName : "0",
    classificCta: currentItem.classificCta ? currentItem.classificCta : "0",
    bankCtaCode: currentItem.bankCtaCode ? currentItem.bankCtaCode : "",
    beneficName: currentItem.beneficName ? currentItem.beneficName : "",
    beneficDni: currentItem.beneficDni ? currentItem.beneficDni : "",
    beneficEmail: currentItem.beneficEmail ? currentItem.beneficEmail : ""
  });

  // Mismas reglas que el back (providerRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateBankAccount(formState), [formState]);

  const { id, isExterior, status, bankName, typeCtaName, classificCta, bankCtaCode, beneficName, beneficDni, beneficEmail } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  const fnClearInputs = () => {
    onResetForm();
  }

  const fnSaveBankAccount = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const newData = buildBankAccountPayload(formState, providerId);

    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/process/providerBanks/${currentItem.id}`, newData, (resp) => {
        fnGetBankAccounts(providerId);
        fnClearInputs();
        setOpen(false);
        setLoading(false);
        setSendForm(false)
      }, (err) => {
        setLoading(false);
        setSendForm(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/process/providerBanks', newData, (resp) => {
        fnGetBankAccounts(providerId);
        fnClearInputs();
        setLoading(false);
        setSendForm(false);
        setOpen(false);
      }, (err) => {
        setLoading(false);
        setSendForm(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="6" xs="6">
            <Checkbox
              name="isExterior"
              value={isExterior}
              label="page.providers.modal.addBankAccount.check.international"
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="6" xs="6" align="right">
            <Checkbox
              onChange={onInputChange}
              name="status"
              value={status}
              label="page.providers.modal.addBankAccount.check.status"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              name="bankName"
              onChange={onInputChange}
              inputValue={bankName}
              label="page.providers.modal.addBankAccount.select.bankNameRequired"
              options={listBanks}
              invalid={sendForm && !!errors.bankName}
              feedbackText={showError('bankName')}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="7">
            <SimpleSelect
              value={typeCtaName}
              name="typeCtaName"
              onChange={onInputChange}
              options={ACCOUNT_TYPE_OPTIONS}
              label="page.providers.modal.addBankAccount.select.typeAccountRequired"
              invalid={sendForm && !!errors.typeCtaName}
              feedbackText={showError('typeCtaName')}
            />
          </Colxx>
          <Colxx xxs="12" xs="5">
            <SimpleSelect
              value={classificCta}
              name="classificCta"
              onChange={onInputChange}
              options={CLASSIFICATION_OPTIONS}
              invalid={sendForm && !!errors.classificCta}
              feedbackText={showError('classificCta')}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="5">
            <InputField
              value={bankCtaCode}
              name="bankCtaCode"
              maxLength={ACCOUNT_NUMBER_MAX}
              onChange={onInputChange}
              label="page.providers.modal.addBankAccount.input.accountNumRequired"
              type="text"
              invalid={sendForm && !!errors.bankCtaCode}
              feedbackText={showError('bankCtaCode')}
            />
          </Colxx>
          <Colxx xxs="12" xs="7">
            <InputField
              value={beneficName}
              name="beneficName"
              maxLength={BENEFICIARY_MAX}
              onChange={onInputChange}
              type="text"
              label="page.providers.modal.addBankAccount.input.beneficiaryRequired"
              invalid={sendForm && !!errors.beneficName}
              feedbackText={showError('beneficName')}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="5">
            <InputField
              value={beneficDni}
              name="beneficDni"
              maxLength={BENEFICIARY_DNI_MAX}
              invalid={sendForm && !!errors.beneficDni}
              feedbackText={showError('beneficDni')}
              onChange={onInputChange}
              type="text"
              label="page.providers.modal.addBankAccount.input.rtn"
            />
          </Colxx>
          <Colxx xxs="12" xs="7">
            <InputField
              value={beneficEmail}
              name="beneficEmail"
              maxLength={BENEFICIARY_EMAIL_MAX}
              invalid={sendForm && !!errors.beneficEmail}
              feedbackText={showError('beneficEmail')}
              onChange={onInputChange}
              type="text"
              label="page.providers.modal.addBankAccount.input.email"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveBankAccount}><i className="iconsminds-save" />
          {` ${IntlMessages("button.save")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddBankAccount;