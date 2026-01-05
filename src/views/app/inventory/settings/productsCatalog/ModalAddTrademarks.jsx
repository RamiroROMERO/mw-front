import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { InputField } from '@/components/inputFields'
import { request } from '@/helpers/core'

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
    if (nameTrademark.lenght < 3) {
      return
    }
    const data = { name: nameTrademark };
    setLoading(true);
    request.POST('inventory/settings/trademarks', data, (resp) => {
      setLoading(false);
      fnGetTrademarks();
      setOpen(false)
    }, err => {
      setLoading(false);
      setOpen(false);
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