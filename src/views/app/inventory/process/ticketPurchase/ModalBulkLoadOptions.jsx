import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { Checkbox } from '@Components/checkbox'
import { IntlMessages } from '@Helpers/Utils'

// Legacy Controlpanel21.OptPages.Page1.Controlpanelbtn1.Click (líneas 1849-1913): antes de traer las líneas de la Orden de Compra pide
// Almacén + Cuenta Contable + "Aplica a Inventario" para aplicarlos uniformemente a todas las líneas que se importen (solo con
// Contabilidad activa: sin ella este modal no se abre). Con "Aplica a Inventario" el almacén es obligatorio, como en cada línea.
const ModalBulkLoadOptions = ({ data, setOpen }) => {
  const { listStores, listAccounts, fnConfirmBulkLoad } = data;

  const [storeId, setStoreId] = useState(0);
  const [expenseCtaCode, setExpenseCtaCode] = useState('');
  const [toInventory, setToInventory] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const storeMissing = toInventory && !(Number(storeId) > 0);

  const fnContinue = () => {
    setSendForm(true);
    if (storeMissing) return;
    fnConfirmBulkLoad({ storeId: toInventory ? storeId : 0, expenseCtaCode: expenseCtaCode === '0' ? '' : expenseCtaCode, toInventory });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <p>{IntlMessages("page.ticketPurchase.modal.bulkLoad.text")}</p>
          </Colxx>
          <Colxx xxs="12" sm="6">
            <SearchSelect
              label="select.storeId"
              name="storeId"
              inputValue={storeId}
              options={listStores}
              onChange={(e) => setStoreId(e.target.value)}
              invalid={sendForm && storeMissing}
              feedbackText={sendForm && storeMissing ? 'page.ticketPurchase.error.storeToInventory' : undefined}
            />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <SearchSelect
              label="select.accountId"
              name="expenseCtaCode"
              inputValue={expenseCtaCode}
              options={listAccounts}
              onChange={(e) => setExpenseCtaCode(e.target.value)}
            />
          </Colxx>
          <Colxx xxs="12">
            <Checkbox
              name="toInventory"
              label="page.ticketPurchase.check.applyToAllLines"
              value={toInventory}
              onChange={(e) => setToInventory(e.target.checked)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnContinue}>
          <i className="bi bi-arrow-right-circle" />
          {` ${IntlMessages('button.accept')}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalBulkLoadOptions
