import FullCalendar from '@fullcalendar/react'
import { Card, CardBody } from 'reactstrap'
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useBirthdaysMonth } from './useBirthdaysMonth';

const Content = ({ setLoading }) => {

  const {dataBirthdays, contentRef} = useBirthdaysMonth({setLoading});

  return (
    <Card>
      <CardBody>
        <div ref={contentRef}>
          <FullCalendar
            locale={esLocale}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={dataBirthdays}
            eventClick={()=>{}}
            eventDidMount={(info) => {
              const titleEl = info.el.querySelector('.fc-event-title')

              if (titleEl) {
                const isOverflowing =
                  titleEl.scrollWidth > titleEl.clientWidth

                if (isOverflowing) {
                  info.el.setAttribute('title', info.event.title)
                }
              }
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default Content