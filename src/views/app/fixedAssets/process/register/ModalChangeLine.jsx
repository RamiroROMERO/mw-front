import { useState, useEffect } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

export const ModalChangeLine = ({ data, setOpen }) => {
  const { editingLine, fnSaveChangeLine } = data;
  const [form, setForm] = useState(editingLine || { date: '', description: '', value: 0 });

  useEffect(() => {
    setForm(editingLine || { date: '', description: '', value: 0 });
  }, [editingLine]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = () => {
    fnSaveChangeLine(form);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <DateCalendar name="date" label="table.column.date" value={form.date} onChange={onChange} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField name="value" label="table.column.value" type="text" value={form.value} onChange={onChange} />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="description" label="page.variousDeposits.input.description" type="textarea" value={form.description} onChange={onChange} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onSave}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
