import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { RadioGroup } from "@Components/radioGroup";
import { RadioButton } from "@Components/radioGroup/RadioButton";
import notification from '@Containers/ui/Notifications';
import { useForm } from "@Hooks";

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
