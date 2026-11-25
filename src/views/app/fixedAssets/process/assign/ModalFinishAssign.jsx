import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { localToday } from '../register/registerRules';
import { validateFinish } from './assignRules';

export const ModalFinishAssign = ({ data, setOpen }) => {
  const { fnFinishAssign, assignDate } = data;
  const [dateEnd, setDateEnd] = useState(DateHelper.format(DateHelper.now()));
  const [notesEnd, setNotesEnd] = useState('');
  const [sendForm, setSendForm] = useState(false);
  const errors = validateFinish({ dateEnd, notesEnd }, assignDate);

  const onSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    fnFinishAssign({ dateEnd, notesEnd });
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <DateCalendar name="dateEnd" label="page.fixedAssets.input.dateEnd" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} maxDate={localToday()} feedbackText={sendForm && (errors.dateEnd || null)} />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="notesEnd" label="page.fixedAssets.input.notesEnd" type="textarea" value={notesEnd} onChange={(e) => setNotesEnd(e.target.value)} maxLength={2000} invalid={sendForm && !!errors.notesEnd} feedbackText={sendForm && (errors.notesEnd || null)} />
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
