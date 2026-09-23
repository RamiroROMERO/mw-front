import { IntlMessages } from "@Helpers/Utils";
import { Card, CardBody, Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import DateCalendar from '@Components/dateCalendar';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useFiscalPeriods } from './useFiscalPeriods';

const FiscalPeriods = (props) => {
  const { setLoading } = props;
  const { formState, formValidation, onInputChange, fnSave, fnClearInputs, table, propsToMsgDelete, sendForm } = useFiscalPeriods({ setLoading });

  const { period, dateIn, dateOut, active, status } = formState;

  const { periodValid, dateInValid, dateOutValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <Row className='mb-3'>
                <Colxx xxs="12" xs="6">
                  <InputField
                    name="period"
                    onChange={onInputChange}
                    value={period}
                    label="page.fiscalPeriods.input.period"
                    type="text"
                    invalid={sendForm && !!periodValid}
                    feedbackText={sendForm && (periodValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <Checkbox
                    name="active"
                    onChange={onInputChange}
                    value={active}
                    label="page.fiscalPeriods.checkbox.active"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <DateCalendar
                    name="dateIn"
                    value={dateIn}
                    label="page.fiscalPeriods.input.dateIn"
                    onChange={onInputChange}
                    invalid={sendForm && !!dateInValid}
                    feedbackText={sendForm && (dateInValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <DateCalendar
                    name="dateOut"
                    value={dateOut}
                    label="page.fiscalPeriods.input.dateOut"
                    onChange={onInputChange}
                    invalid={sendForm && !!dateOutValid}
                    feedbackText={sendForm && (dateOutValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <Checkbox
                    name="status"
                    onChange={onInputChange}
                    value={status}
                    label="page.fiscalPeriods.checkbox.status"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button
                    color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
                  </Button>
                  <Button
                    color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default FiscalPeriods;
