import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import DateCalendar from '@/components/dateCalendar';
import ReactTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import { useScheduling } from './useScheduling';

const Scheduling = (props) => {
  const { setLoading } = props;

  const {sendForm, table, propsToMsgDelete, formState, formValidation, fnClearInputs, fnSave, onInputChange, fnFilterCalendar} = useScheduling({setLoading});

  const { dateIn, dateOut, period, status } = formState;

  const { dateInValid, dateOutValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="5">
          <Card className='mb-3'>
            <CardBody>
              <Row className='mb-3'>
                <Colxx xxs="12" sm="6" lg="12">
                  <DateCalendar
                    name="dateIn"
                    value={dateIn}
                    label="page.scheduling.input.dateIn"
                    onChange={onInputChange}
                    invalid={sendForm && !!dateInValid}
                    feedbackText={sendForm && (dateInValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <DateCalendar
                    name="dateOut"
                    value={dateOut}
                    label="page.scheduling.input.dateOut"
                    onChange={onInputChange}
                    invalid={sendForm && !!dateOutValid}
                    feedbackText={sendForm && (dateOutValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    name="period"
                    value={period}
                    label="page.scheduling.input.period"
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" sm="6" lg="12">
                  <Checkbox
                    name="status"
                    value={status}
                    onChange={onInputChange}
                    label="page.scheduling.checkbox.status"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button
                    color="success" onClick={fnFilterCalendar}><i className="bi bi-funnel" /> {IntlMessages("button.filter")}
                  </Button>
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
        <Colxx xxs="12" lg="7">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Scheduling;