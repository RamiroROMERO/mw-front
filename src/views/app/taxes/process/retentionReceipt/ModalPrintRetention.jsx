import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import { RadioGroup } from '@/components/radioGroup'
import { request } from '@/helpers/core'

const ModalPrintRetention = ({ setOpen, data }) => {
  const { id, setLoading } = data;
  const [typePrint, setTypePrint] = useState([]);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const handleInputChange = e => {
    const value = e.target.value;
    setTypePrint(value);
  }

  const fnPrintRetention = () => {
    const dataPrint = {
      id,
      userName: userData.name,
      typePrint
    }
    request.GETPdf('tax/process/withholdingReceipts/exportPDFRetReceipt', dataPrint, 'Comprobante de Retención.pdf', (err) => {
      setOpen(false);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="select.type"
              name="typePrint"
              value={typePrint}
              onChange={handleInputChange}
              options={
                [
                  { id: 1, label: "radio.original" },
                  { id: 2, label: "radio.copy" }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintRetention}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalPrintRetention