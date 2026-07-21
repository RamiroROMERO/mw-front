import { useEffect, useState } from 'react'
import { request, buildUrl } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';

export const useScheduledAppointments = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openModalAppointment, setOpenModalAppointment] = useState(false);
  const [specialistId, setSpecialistId] = useState(0);
  const [listDoctors, setListDoctors] = useState([]);
  const [listPatients, setListPatients] = useState([]);
  const [listReasons, setListReasons] = useState([]);
  const [listAppointments, setListAppointments] = useState([]);

  const fnGetData = (filterSpecialistId = specialistId) => {
    setLoading(true);
    request.GET(buildUrl('hospital/process/appointments', { specialistId: Number(filterSpecialistId) || undefined }), (resp) => {
      const data = resp.data.map((item) => {
        return {
          id: item.id,
          title: `${item.hospExpedient?.name || ''} - ${item.specialist?.name || ''}`,
          start: `${DateHelper.format(item.date, 'YYYY-MM-DD')}T${item.time || '00:00'}`,
          extendedProps: item
        }
      });
      setListAppointments(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const onSpecialistChange = (e) => {
    const { value } = e.target;
    setSpecialistId(value);
    fnGetData(value);
  }

  const fnNewAppointment = () => {
    setCurrentItem({});
    setOpenModalAppointment(true);
  }

  const fnAddAppointmentOnDate = (dateInfo) => {
    setCurrentItem({ date: dateInfo.dateStr });
    setOpenModalAppointment(true);
  }

  const fnViewAppointment = ({ event }) => {
    setCurrentItem(event.extendedProps);
    setOpenModalAppointment(true);
  }

  useEffect(() => {
    fnGetData(0);

    setLoading(true);
    request.GET('hospital/settings/specialists/getSL', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListDoctors(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('hospital/process/expedients/getSL', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = `${item.dni} | ${item.name}`
        return item;
      });
      setListPatients(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('hospital/settings/reasons/getSL', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListReasons(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    buttonsHome: [
      {
        title: "button.newAppointment",
        icon: "bi bi-calendar-plus",
        onClick: fnNewAppointment
      }
    ],
    disableTab: [false, true, true]
  }

  const dataModalAppointment = {
    setLoading,
    currentItem,
    listDoctors,
    listPatients,
    listReasons,
    fnGetData
  }

  return (
    {
      propsToControlPanel,
      listAppointments,
      specialistId,
      listDoctors,
      onSpecialistChange,
      fnAddAppointmentOnDate,
      fnViewAppointment,
      openModalAppointment,
      setOpenModalAppointment,
      dataModalAppointment
    }
  )
}
