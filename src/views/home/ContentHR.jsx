import React from 'react'
import './styleCalendar.css';
import HeaderHR from './HeaderHR'
import { useHeaderHR } from './useHeaderHR';
import { useContentHR } from './useContentHR';
import { Card, CardBody, Modal } from 'reactstrap';
import FullCalendar from '@fullcalendar/react';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import ModalAddSchedule from './ModalAddSchedule';

const ContentHR = ({ setLoading }) => {

  const { contentRef, currentItem, openModalAddSchedule, setopenModalAddSchedule, listProjects, listTurns, listWorkShedules, setListWorkSchedules, setCurrentItem, fnPrintSchedule } = useContentHR({ setLoading });

  const { projectId, onProjectChange, fnAddSchedule, fnGetData } = useHeaderHR({ setopenModalAddSchedule, setListWorkSchedules, setLoading, setCurrentItem });

  const fnViewEvent = ({ event }) => {
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
      <HeaderHR {...propsToHeader} />
      <Card>
        <CardBody>
          <div ref={contentRef}>
            <FullCalendar
              locale={esLocale}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={listWorkShedules}
              eventClick={fnViewEvent}
            />
          </div>
        </CardBody>
      </Card>
      <Modal {...propsToModalAddSchedule} />
    </>
  )
}


export default ContentHR