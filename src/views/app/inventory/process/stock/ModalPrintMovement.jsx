import React, { useState } from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { RadioGroup } from '@/components/radioGroup'

const ModalPrintMovement = ({setOpen}) => {
  const [typePrint, setTypePrint] = useState(0);

  const onInputChange = e =>{
    setTypePrint(e.target.value);
  }

  const fnPrintReport = ()=>{}

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="page.stock.modal.printMovements.radio.type"
              name="typePrint"
              value={typePrint}
              onChange={onInputChange}
              options={[
                {id:1, label: 'page.stock.modal.printMovements.radio.detail'},
                {id:2, label: 'page.stock.modal.printMovements.radio.summary'}
              ]}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintReport}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}}>
          <i className="bi bi-box-arrow-right"/> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalPrintMovement