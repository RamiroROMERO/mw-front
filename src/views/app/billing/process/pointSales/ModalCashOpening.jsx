import { useEffect, useState } from "react";
import { Button, Input, Label, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { SimpleSelect } from "@Components/simpleSelect";
import { RadioGroup } from "@Components/radioGroup";
import { InputField } from "@Components/inputFields";
import DateCalendar from "@Components/dateCalendar";
import notification from "@Containers/ui/Notifications";
import DateHelper from '@Helpers/DateHelper';
import { buildOpenRequest, buildStoredSession, localToday, needsDateConfirm, validateOpening } from './posSessionRules';

const SESSION_URL = 'billing/process/pointSales/session';

// Apertura de caja del POS (SPEC v2-78-sr): el cajero se identifica con correo y contraseña, el servidor valida y persiste la apertura y devuelve caja, área,
// almacén, documento, precios, permisos y configuración; lo digitado solo es caja, día, monto inicial y formato.
const ModalCashOpening = (props) => {
  const { data, setOpen } = props;
  const { setBulkFormDetail, setBulkFormIndex, setLoading, userData } = data;
  const [sendForm, setSendForm] = useState(false);
  const [registers, setRegisters] = useState([]);
  const [confirmDate, setConfirmDate] = useState(false);
  const incompleteText = IntlMessages('msg.error.pos.registerIncomplete');

  const { formState, onInputChange } = useForm({
    cashBox: 0,
    email: userData?.email || '',
    dateCashOpen: DateHelper.format(new Date()),
    cashierPass: '',
    initialValue: '',
    typePrint: 1
  }, {});
  const { cashBox, email, dateCashOpen, cashierPass, initialValue, typePrint } = formState;
  const errors = validateOpening(formState);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    request.GET(`${SESSION_URL}/registers`, (resp) => {
      const list = resp.data || [];
      setRegisters(list);
      const first = list.find((item) => item.complete);
      if (first) onInputChange({ target: { name: 'cashBox', value: first.id } });
    });
  }, []);

  const fnSaveCashBox = () => {
    setSendForm(true);
    if (hasErrors) return;
    if (needsDateConfirm(formState) && !confirmDate) return;

    setLoading(true);
    request.POST(`${SESSION_URL}/open`, buildOpenRequest(formState, confirmDate), (resp) => {
      const stored = buildStoredSession(resp.data);
      localStorage.setItem('dataCashBox_current', JSON.stringify(stored));
      setBulkFormDetail({ areaId: stored.areaId, storeId: stored.storeId, typePrice: stored.typePrice });
      setBulkFormIndex({ documentCode: stored.documentCode, dateInProcess: stored.dateInProcess, printType: stored.printType });
      const stale = resp.data.warnings?.find((item) => item.code === 'pos.open.staleSessions');
      if (stale) notification('warning', 'msg.warning.pos.staleSessions', 'alert.warning.title');
      setOpen(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const registerOptions = registers.map((item) => ({ id: item.id, name: item.complete ? item.name : `${item.name} (${incompleteText})` }));
  const dateNotToday = needsDateConfirm(formState);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              name="cashBox"
              label="page.pointSales.modal.cashOpening.select.cashBox"
              value={cashBox}
              onChange={onInputChange}
              options={registerOptions}
              invalid={sendForm && !!errors.cashBox}
              feedbackText={sendForm && (errors.cashBox || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              value={email}
              id="email"
              name="email"
              onChange={onInputChange}
              label="page.pointSales.modal.cashOpening.input.cashierEmail"
              invalid={sendForm && !!errors.email}
              feedbackText={sendForm && (errors.email || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              value={cashierPass}
              id="cashierPass"
              name="cashierPass"
              onChange={onInputChange}
              type="password"
              label="page.pointSales.modal.cashOpening.input.cashierPass"
              invalid={sendForm && !!errors.cashierPass}
              feedbackText={sendForm && (errors.cashierPass || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <DateCalendar
              value={dateCashOpen}
              name="dateCashOpen"
              label="page.invoicing.input.dateInProcess"
              onChange={(event) => { setConfirmDate(false); onInputChange(event); }}
              maxDate={localToday()}
            />
            {sendForm && errors.dateCashOpen ? <small className="text-danger">{IntlMessages(errors.dateCashOpen)}</small> : null}
            {dateNotToday && !errors.dateCashOpen ? (
              <div className="mb-2">
                <Input type="checkbox" id="confirmDate" checked={confirmDate} onChange={(event) => setConfirmDate(event.target.checked)} />
                {' '}<Label for="confirmDate">{IntlMessages('page.pointSales.modal.cashOpening.confirmDate')}</Label>
                {sendForm && !confirmDate ? <div><small className="text-danger">{IntlMessages('msg.error.pos.dateConfirm')}</small></div> : null}
              </div>
            ) : null}
          </Colxx>
          <Colxx xxs="12">
            <InputField
              value={initialValue}
              id="initialValue"
              name="initialValue"
              onChange={onInputChange}
              label="page.pointSales.modal.cashOpening.input.initialValue"
              invalid={sendForm && !!errors.initialValue}
              feedbackText={sendForm && (errors.initialValue || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <RadioGroup
              label="page.pointSales.modal.cashOpening.input.invoiceFormat"
              name="typePrint"
              value={typePrint}
              onChange={onInputChange}
              options={
                [
                  { id: 1, label: "page.pointSales.modal.cashOpening.radio.pos" },
                  { id: 2, label: "page.pointSales.modal.cashOpening.radio.halfLetter" },
                  { id: 3, label: "page.pointSales.modal.cashOpening.radio.letter" }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveCashBox}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalCashOpening;
