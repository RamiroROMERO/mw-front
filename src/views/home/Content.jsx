import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, CardBody } from 'reactstrap';
import { useHome } from './useHome';
import Modal from '@Components/modal';
import ModalAddSchedule from './ModalAddSchedule';
import Header from './Header';
import './styleCalendar.css';
import { useHeader } from './useHeader';

const Content = (props) => {
  const { setLoading } = props;

  const {contentRef, currentItem, openModalAddSchedule, setopenModalAddSchedule, listProjects, listTurns, listWorkShedules, setListWorkSchedules, setCurrentItem, fnPrintSchedule} = useHome({setLoading});

  const {projectId, onProjectChange, fnAddSchedule, fnGetData} = useHeader({setopenModalAddSchedule, setListWorkSchedules, setLoading, setCurrentItem});

  const fnViewEvent = ({event}) => {
    const detail = event.extendedProps;

    setCurrentItem(detail);
    setopenModalAddSchedule(true);
  }

  const propsToHeader = {
    listProjects,
    projectId,
    onProjectChange,
    fnAddSchedule,
    fnPrintSchedule
  }

  const propsToModalAddSchedule = {
    ModalContent: ModalAddSchedule,
    title: "page.home.modal.addScheduling.title",
    open: openModalAddSchedule,
    setOpen: setopenModalAddSchedule,
    maxWidth: 'lg',
    data: {
      projectId,
      setLoading,
      currentItem,
      listTurns,
      fnGetData
    }
  }

  return (
    <>
      <Header {...propsToHeader}/>
      <Card>
        <CardBody>
          <div ref={contentRef}>
            <FullCalendar
              locale= {esLocale}
              plugins={[ dayGridPlugin ]}
              initialView="dayGridMonth"
              events={listWorkShedules}
              eventClick={fnViewEvent}
            />
          </div>
        </CardBody>
      </Card>
      <Modal {...propsToModalAddSchedule} />
    </>
  );
}
export default Content;