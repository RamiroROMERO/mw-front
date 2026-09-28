import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';

export const ModalFinishAssign = ({ data, setOpen }) => {
  const { fnFinishAssign } = data;
  const [dateEnd, setDateEnd] = useState(DateHelper.format(DateHelper.now()));
  const [notesEnd, setNotesEnd] = useState('');

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <DateCalendar name="dateEnd" label="page.fixedAssets.input.dateEnd" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="notesEnd" label="page.fixedAssets.input.notesEnd" type="textarea" value={notesEnd} onChange={(e) => setNotesEnd(e.target.value)} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => fnFinishAssign({ dateEnd, notesEnd })}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
