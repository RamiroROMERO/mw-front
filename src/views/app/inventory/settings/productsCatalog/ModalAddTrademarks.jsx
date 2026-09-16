import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { request } from '@Helpers/core'
import notification from '@Containers/ui/Notifications';

// Mismo patrón que ModalAddLocations.jsx — ver TrademarkController.
const fnHandleSaveError = (err) => {
  if (err?.messages?.[0]?.message === 'trademark.alreadyExists') {
    notification('error', 'msg.error.trademark.alreadyExists', 'alert.error.title');
  } else {
    notification('error', 'msg.save.record.error', 'alert.error.title');
  }
}

const ModalAddTrademarks = ({ setOpen, data }) => {
  const { setLoading, setListTrademarks } = data;

  const [nameTrademark, setNameTrademark] = useState('')

  const fnGetTrademarks = () => {
    request.GET('inventory/settings/trademarks', (resp) => {

      const trademarks = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.name
        }
      });
      setListTrademarks(trademarks);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveTrademark = () => {
    if (nameTrademark.length < 3) {
      return
    }
    const data = { name: nameTrademark };
    setLoading(true);
    request.POST('inventory/settings/trademarks', data, (resp) => {
      setLoading(false);
      fnGetTrademarks();
      setOpen(false)
    }, err => {
      fnHandleSaveError(err);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              label="input.name"
              id="nameTrademark"
              name="nameTrademark"
              value={nameTrademark}
              onChange={({ target }) => setNameTrademark(target.value)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveTrademark}>
          <i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddTrademarks