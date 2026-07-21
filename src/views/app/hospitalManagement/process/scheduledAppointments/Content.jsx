import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import FullCalendar from '@fullcalendar/react';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useScheduledAppointments } from './useScheduledAppointments';
import ModalAppointment from './ModalAppointment';

const Content = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, listAppointments, specialistId, listDoctors, onSpecialistChange,
    fnAddAppointmentOnDate, fnViewAppointment, openModalAppointment, setOpenModalAppointment,
    dataModalAppointment
  } = useScheduledAppointments({ setLoading });

  const propsToModalAppointment = {
    ModalContent: ModalAppointment,
    title: "page.appointments.modal.title",
    open: openModalAppointment,
    setOpen: setOpenModalAppointment,
    maxWidth: 'lg',
    data: dataModalAppointment
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-2" />
              <Row className="mb-3">
                <Colxx xxs={12} sm={6} md={4} xl={3}>
                  <SearchSelect
                    name="specialistId"
                    inputValue={specialistId}
                    onChange={onSpecialistChange}
                    options={listDoctors}
                    label="select.doctorId"
                  />
                </Colxx>
              </Row>
              <FullCalendar
                locale={esLocale}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={listAppointments}
                dateClick={fnAddAppointmentOnDate}
                eventClick={fnViewAppointment}
              />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAppointment} />
    </>
  );
}
export default Content;