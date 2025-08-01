import React from 'react'
import { Colxx } from "@/components/common/CustomBootstrap";
import { RadioGroup } from "@/components/radioGroup";
import { IntlMessages } from "@/helpers/Utils";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";

const ModalTypeSheet = ({ data, setOpen }) => {
  const { typeSheet, setTypeSheet, disabledOpt = 0, fnPrintDocument } = data;

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setTypeSheet(value);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx>
            <RadioGroup
              label="title.sheetSize"
              name="typeSheet"
              value={typeSheet}
              onChange={handleInputChange}
              options={
                [
                  { id: 1, label: "radio.ticket", disabled: disabledOpt === 1 },
                  { id: 2, label: "radio.halfLetter", disabled: disabledOpt === 2 },
                  { id: 3, label: "radio.letter", disabled: disabledOpt === 3 }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintDocument}>
          <i className="iconsminds-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalTypeSheet