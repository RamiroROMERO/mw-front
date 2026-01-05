import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import { SimpleSelect } from "@/components/simpleSelect";
import { InputField } from "@/components/inputFields";
import { Checkbox } from "@/components/checkbox";
import { request } from '@/helpers/core';
import { useForm } from "@/hooks";

const ModalAddBankAccount = (props) => {
  const { data, setOpen } = props;
  const { currentItem, setLoading, listBanks, fnGetBankAccounts, providerId } = data;
  const listAccount = [{ id: 1, name: 'Cuenta de Ahorro' }, { id: 2, name: 'Cuenta de Cheques' }, { id: 3, name: 'Cuenta de Ahorro en Dolares' }, { id: 4, name: 'Cuenta de Cheques en Dolares' }];
  const listAccount2 = [{ id: 1, name: 'CA' }, { id: 2, name: 'CC' }];
  const [sendForm, setSendForm] = useState(false);

  const providersValid = {
    bankName: [(val) => val !== "", "msg.required.select.bank"],
    typeCtaName: [(val) => validInt(val) > 0, "msg.required.select.typeAccount"],
    classificCta: [(val) => validInt(val) > 0, "msg.required.select.typeAccount"],
    bankCtaCode: [(val) => val !== "", "msg.required.input.accountNum"],
    beneficName: [(val) => val !== "", "msg.required.input.beneficiary"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
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
  }, providersValid);

  const { id, isExterior, status, bankName, typeCtaName, classificCta, bankCtaCode, beneficName, beneficDni, beneficEmail } = formState;

  const { bankNameValid, typeCtaNameValid, classificCtaValid, bankCtaCodeValid, beneficNameValid } = formValidation;

  const fnClearInputs = () => {
    onResetForm();
  }

  const fnSaveBankAccount = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      providerId,
      classificCta,
      typeCtaName,
      bankName,
      bankCtaCode,
      beneficName,
      beneficDni,
      beneficEmail,
      isExterior,
      status
    }

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
              label="page.providers.modal.addBankAccount.select.bankName"
              options={listBanks}
              invalid={sendForm && !!bankNameValid}
              feedbackText={sendForm && (bankNameValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="7">
            <SimpleSelect
              value={typeCtaName}
              name="typeCtaName"
              onChange={onInputChange}
              options={listAccount}
              label="page.providers.modal.addBankAccount.select.typeAccount"
              invalid={sendForm && !!typeCtaNameValid}
              feedbackText={sendForm && (typeCtaNameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="5">
            <SimpleSelect
              value={classificCta}
              name="classificCta"
              onChange={onInputChange}
              options={listAccount2}
              invalid={sendForm && !!classificCtaValid}
              feedbackText={sendForm && (classificCtaValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="5">
            <InputField
              value={bankCtaCode}
              name="bankCtaCode"
              onChange={onInputChange}
              label="page.providers.modal.addBankAccount.input.accountNum"
              type="text"
              invalid={sendForm && !!bankCtaCodeValid}
              feedbackText={sendForm && (bankCtaCodeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="7">
            <InputField
              value={beneficName}
              name="beneficName"
              onChange={onInputChange}
              type="text"
              label="page.providers.modal.addBankAccount.input.beneficiary"
              invalid={sendForm && !!beneficNameValid}
              feedbackText={sendForm && (beneficNameValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="5">
            <InputField
              value={beneficDni}
              name="beneficDni"
              onChange={onInputChange}
              type="text"
              label="page.providers.modal.addBankAccount.input.rtn"
            />
          </Colxx>
          <Colxx xxs="12" xs="7">
            <InputField
              value={beneficEmail}
              name="beneficEmail"
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