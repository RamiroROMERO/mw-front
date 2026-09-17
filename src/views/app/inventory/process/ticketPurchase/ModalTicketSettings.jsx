import { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import createNotification from '@Containers/ui/Notifications'

const ModalTicketSettings = ({ setOpen }) => {
  const [totalCompany, setTotalCompany] = useState(0);
  const [totalProvider, setTotalProvider] = useState(0);

  useEffect(() => {
    request.GET('inventory/process/ticketPurchase/config', (resp) => {
      setTotalCompany(resp.data?.totalCompany || 0);
      setTotalProvider(resp.data?.totalProvider || 0);
    }, () => { });
  }, []);

  const fnSave = () => {
    request.PUT('inventory/process/ticketPurchase/config', { totalCompany, totalProvider }, () => {
      createNotification('success', 'msg.success.save', 'alert.success.title');
      setOpen(false);
    }, () => { });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="totalCompany"
              label="page.ticketPurchase.input.maxCompany"
              value={totalCompany}
              onChange={(e) => setTotalCompany(e.target.value)}
              type="number"
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="totalProvider"
              label="page.ticketPurchase.input.maxProvider"
              value={totalProvider}
              onChange={(e) => setTotalProvider(e.target.value)}
              type="number"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="bi bi-save" />
          {` ${IntlMessages('button.save')}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalTicketSettings
