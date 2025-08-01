import React from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { RadioGroup } from "@/components/radioGroup";
import { RadioButton } from "@/components/radioGroup/RadioButton";
import notification from '@/containers/ui/Notifications';
import { useForm } from "@/hooks";

export const ModalPrintCheck = ({ data, setOpen }) => {

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    typePrintCheck: 0
  })

  const { typePrintCheck } = formState;

  const fnPrintCheck = () => { }
  return (
    <>
      <ModalBody>
        <Row className="mb-2" >
          <Colxx xxs="12">
            <RadioGroup
              name="typePrintCheck"
              value={typePrintCheck}
              onChange={onInputChange}
              display="flex"
              options={
                [
                  { id: 1, label: 'page.check.modalPrintCheck.title.reqularCheck' },
                  { id: 2, label: 'page.check.modalPrintCheck.title.notNegotiableCheck' },
                  { id: 3, label: 'page.check.modalPrintCheck.title.marknotNegotiable' }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintCheck}>
          <i className="iconsminds-save" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
