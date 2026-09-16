import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, validInt } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from "@Components/simpleSelect";
import { InputField } from "@Components/inputFields";
import { request } from '@Helpers/core';
import Confirmation from '@Containers/ui/confirmationMsg';

// Legacy inv_prov_update_all.sc2: aplica en bloque las cuentas contables por defecto de
// un Tipo de Proveedor a TODOS los proveedores de esa clasificación.
const ModalUpdateAllAccounts = (props) => {
  const { data, setOpen } = props;
  const { setLoading, listTypeProviders, listLedgerAccounts } = data;

  const [providerTypeId, setProviderTypeId] = useState(0);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const selectedType = listTypeProviders.find((item) => `${item.id}` === `${providerTypeId}`);

  const fnAccountLabel = (code) => {
    if (!code) return '';
    const account = listLedgerAccounts.find((item) => `${item.value}` === `${code}`);
    return account ? account.label : code;
  }

  const fnAskUpdate = () => {
    if (validInt(providerTypeId) === 0) {
      return;
    }
    setOpenMsgQuestion(true);
  }

  const fnConfirmUpdate = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.POST('inventory/process/providers/bulkUpdateAccountsByType', { providerTypeId }, (resp) => {
      setLoading(false);
      setOpen(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const propsToMsgQuestion = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmUpdate,
    title: "page.providers.modal.updateAllAccounts.question"
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              name="providerTypeId"
              value={providerTypeId}
              onChange={({ target }) => setProviderTypeId(target.value)}
              label="page.providers.select.typeProvider"
              options={listTypeProviders}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaCxp)} label="page.providers.select.accountsPayable" type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaDesc)} label="page.providers.select.discountAccounts" type="text" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaIva)} label="page.providers.select.ivaAccounts" type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaFlete)} label="page.providers.select.freightAccounts" type="text" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaBon)} label="page.providers.select.bonusAccounts" type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <InputField disabled value={fnAccountLabel(selectedType?.idCtaOther)} label="page.providers.select.otherSurcharges" type="text" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAskUpdate}><i className="iconsminds-save" />
          {` ${IntlMessages("button.update")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgQuestion} />
    </>
  )
}

export default ModalUpdateAllAccounts;
