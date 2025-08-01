import React, { useEffect, useState } from 'react'
import { IntlMessages, formatDate } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useEvents = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openModalEvents, setOpenModalEvents] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [openModalHosp, setOpenModalHosp] = useState(false);
  const [openMsgCloseEvent, setOpenMsgCloseEvent] = useState(false);
  const [listAreas, setListAreas] = useState([]);
  const [listDoctors, setListDoctors] = useState([]);
  const [listPatients, setListPatients] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listReasons, setListReasons] = useState([]);
  const [listRooms, setListRooms] = useState([]);

  const fnNewEvent = () => {
    setCurrentItem({});
    setOpenModalEvents(true);
  }

  const fnEditDocument = (item) => {
    setCurrentItem(item);
    setOpenModalEvents(true);
  }

  const fnDetailDocument = (item) => {
    setCurrentItem(item);
    setOpenModalDetail(true);
  }

  const fnGoToHospitalization = (item) => {
    setCurrentItem(item);
    setOpenModalHosp(true);
  }

  const fnCloseDocument = (item) => {
    setCurrentItem(item);
    setOpenMsgCloseEvent(true);
  }

  const fnOkCloseEvent = () => {

    const newData = {
      status: 2
    }

    request.PUT(`hospital/process/events/${currentItem.id}`, newData, (resp) => {
      setLoading(false);
      setOpenMsgCloseEvent(false);
      fnGetData();
    }, (err) => {
      console.log(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.events.table.title"),
    columns: [
      { text: IntlMessages("table.column.no"), dataField: "id", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.date"), dataField: "dateEvent", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.patient"), dataField: "patient", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("table.column.hall"), dataField: "hall", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.doctor"), dataField: "doctor", headerStyle: { 'width': '25%' } }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [
      {
        color: 'warning',
        icon: 'pencil',
        onClick: fnEditDocument,
        toolTip: IntlMessages("button.edit")
      },
      {
        color: 'info',
        icon: 'list',
        onClick: fnDetailDocument,
        toolTip: IntlMessages("button.detail")
      },
      {
        color: 'success',
        icon: 'arrow-right',
        onClick: fnGoToHospitalization,
        toolTip: IntlMessages("button.goToHosp")
      },
      {
        color: 'secondary',
        icon: 'clipboard-x',
        onClick: fnCloseDocument,
        toolTip: IntlMessages("button.closeEvent")
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`hospital/process/events/getTable?typeId=1`, (resp) => {
      const data = resp.data.map((item) => {
        item.patient = item.hospExpedient?.name || '';
        item.hall = item.hospArea?.name || '';
        item.doctor = item.specialist1?.name || '';
        item.dateEvent = formatDate(item.date);
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();

    setLoading(true);
    request.GET('admin/areas/getSL?isHospital=1', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListAreas(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

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
      console.log(err)
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
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListStores(data);
      setLoading(false);
    }, err => {
      console.log(err)
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
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('hospital/settings/rooms/getSL', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListRooms(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    buttonsHome: [
      {
        title: "button.event",
        icon: "bi bi-plus-lg",
        onClick: fnNewEvent
      }
    ],
    disableTab: [false, true, true]
  }

  const dataModalEvents = {
    setLoading,
    idPatientFile: 0,
    codeFile: '',
    dni: '',
    namePatient: '',
    listAreas,
    listDoctors,
    listPatients,
    typeEvent: 2,
    fnGetEvents: fnGetData,
    currentItem
  }

  const dataModalDetail = {
    setLoading,
    currentItem,
    listAreas,
    listStores
  }

  const dataModalHosp = {
    setLoading,
    currentItem,
    listDoctors,
    listReasons,
    listRooms,
    fnGetData
  }

  const propsToMsgDelete = {
    title: "page.events.alert.question.closeEvent.title",
    open: openMsgCloseEvent,
    setOpen: setOpenMsgCloseEvent,
    fnOnOk: fnOkCloseEvent,
    fnOnNo: () => { setCurrentItem({}) }
  };

  return (
    {
      propsToControlPanel,
      table,
      dataModalEvents,
      openModalEvents,
      setOpenModalEvents,
      openModalDetail,
      setOpenModalDetail,
      dataModalDetail,
      openModalHosp,
      setOpenModalHosp,
      dataModalHosp,
      propsToMsgDelete
    }
  )
}
