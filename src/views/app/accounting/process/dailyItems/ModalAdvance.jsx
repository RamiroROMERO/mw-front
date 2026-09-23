import { useEffect, useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

const today = () => new Date().toISOString().substring(0, 10);
const emptyAdvance = { providerId: '', date: today(), value: 0, description: '' };

// Botón "Anticipo" (cont_pda_advance.sc2): crea/edita el Anticipo a Proveedores que ESTA
// partida originó. Si ya existe uno (existingAdvance != null), se muestra en modo edición
// con el botón Eliminar visible — igual que Commandbutton_hw3 del legacy.
const ModalAdvance = ({ data, setOpen }) => {
  const { existingAdvance, listProviders, fnSaveAdvance, fnAskRemoveAdvance } = data;
  const [form, setForm] = useState(emptyAdvance);

  useEffect(() => {
    if (existingAdvance) {
      setForm({
        providerId: existingAdvance.providerId,
        date: existingAdvance.date,
        value: existingAdvance.value,
        description: existingAdvance.description
      });
    } else {
      setForm(emptyAdvance);
    }
  }, [existingAdvance]);

  const onChange = ({ target }) => setForm((prev) => ({ ...prev, [target.name]: target.value }));

  const fnAccept = () => {
    fnSaveAdvance(form);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label="page.dailyItems.input.provider"
              name="providerId"
              inputValue={form.providerId}
              onChange={onChange}
              options={listProviders}
              isDisabled={!!existingAdvance}
            />
          </Colxx>
          <Colxx xxs="12">
            <DateCalendar name="date" label="page.dailyItems.input.date" value={form.date} onChange={onChange} />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="value" label="page.dailyItems.input.value" value={form.value} onChange={onChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="description" label="page.dailyItems.input.description" value={form.description} onChange={onChange} type="text" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={fnAskRemoveAdvance} disabled={!existingAdvance}>
          <i className="bi bi-trash" /> {IntlMessages('button.delete')}
        </Button>
        <Button color="secondary" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalAdvance;
