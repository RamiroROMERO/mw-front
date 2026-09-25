import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

// Equivalente a cont_cierres_set.sc2 ("Ajustes de Cierre"). El picker de cuentas del
// legacy filtra `nivel = 6` (hoy inexistente, ver backend) — acá se usa `leafAccounts`
// ya resuelto por el backend contra el nivel hoja real.
const ModalSettings = ({ data, setOpen }) => {
  const { settings, leafAccounts, fnSave } = data;
  const [accountUtil1, setAccountUtil1] = useState(settings?.accountUtil1 || '');
  const [accountUtil2, setAccountUtil2] = useState(settings?.accountUtil2 || '');
  const [accountUtil3, setAccountUtil3] = useState(settings?.accountUtil3 || '');

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12">
            <SearchSelect
              label="page.accountingClosures.modal.settings.accountUtil1"
              name="accountUtil1"
              inputValue={accountUtil1}
              options={leafAccounts}
              onChange={(e) => setAccountUtil1(e.target.value)}
            />
          </Colxx>
        </Row>
        <Row className="mb-2">
          <Colxx xxs="12">
            <SearchSelect
              label="page.accountingClosures.modal.settings.accountUtil2"
              name="accountUtil2"
              inputValue={accountUtil2}
              options={leafAccounts}
              onChange={(e) => setAccountUtil2(e.target.value)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label="page.accountingClosures.modal.settings.accountUtil3"
              name="accountUtil3"
              inputValue={accountUtil3}
              options={leafAccounts}
              onChange={(e) => setAccountUtil3(e.target.value)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => fnSave({ accountUtil1, accountUtil2, accountUtil3 })}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.accept')}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSettings
