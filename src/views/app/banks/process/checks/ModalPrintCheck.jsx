import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from "@Helpers/Utils";
import { printDocument } from '@Helpers/printDocument';
import { RadioGroup } from "@Components/radioGroup";
import notification from '@Containers/ui/Notifications';
import { useForm } from "@Hooks";
import { buildCheckPrintQuery } from './checkPrintModes';

// Impresión del cheque físico (SPEC v2-21): el back imprime lo guardado, solo los campos variables, para el papel
// preimpreso del banco. El cheque tiene que estar guardado (`checkId`).
export const ModalPrintCheck = ({ data, setOpen }) => {
  const { checkId, setLoading } = data;

  const { formState, onInputChange } = useForm({
    typePrintCheck: 0,
    city: ''
  })

  const { typePrintCheck, city } = formState;

  const fnPrintCheck = () => {
    const query = buildCheckPrintQuery(typePrintCheck, city);
    if (!query) {
      notification('warning', 'msg.print.selectType', 'alert.warning.title');
      return;
    }
    const started = printDocument({
      path: 'banks/process/checks', id: checkId, suffix: 'print/format', query, fileName: 'Cheque.pdf', setLoading
    });
    if (started) setOpen(false);
  }

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
        <Row className="mb-2">
          <Colxx xxs="12">
            <InputField name="city" value={city} onChange={onInputChange} label="page.check.modalPrintCheck.input.city" type="text" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintCheck}>
          <i className="bi bi-printer" /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
