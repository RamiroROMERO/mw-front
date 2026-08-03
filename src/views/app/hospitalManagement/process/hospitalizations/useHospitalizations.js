import { useEffect, useState } from 'react'
import { IntlMessages, formatDate } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';

export const useHospitalizations = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [openModalRoom, setOpenModalRoom] = useState(false);
  const [openMsgDischarge, setOpenMsgDischarge] = useState(false);
  const [listAreas, setListAreas] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listRooms, setListRooms] = useState([]);

  const fnDetailDocument = (item) => {
    setCurrentItem(item);
    setOpenModalDetail(true);
  }

  const fnChangeRoom = (item) => {
    setCurrentItem(item);
    setOpenModalRoom(true);
  }

  const fnDischarge = (item) => {
    setCurrentItem(item);
    setOpenMsgDischarge(true);
  }

  const fnOkDischarge = () => {
    setLoading(true);
    request.PUT(`hospital/process/events/${currentItem.id}`, { status: 2, dateOut: DateHelper.getDateOnly() }, (resp) => {
      setLoading(false);
      setOpenMsgDischarge(false);
      fnGetData();
    }, (err) => {
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hospitalizations.table.title"),
    columns: [
      { text: IntlMessages("table.column.no"), dataField: "id", headerStyle: { 'width': '8%' } },
      { text: IntlMessages("table.column.admissionDate"), dataField: "dateEvent", headerStyle: { 'width': '12%' } },
      { text: IntlMessages("table.column.patient"), dataField: "patient", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.room"), dataField: "room", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.responsibleDoctor"), dataField: "doctor", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("table.column.daysStay"), dataField: "daysStay", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [
      {
        color: 'info',
        icon: 'list',
        onClick: fnDetailDocument,
        toolTip: IntlMessages("button.detail")
      },
      {
        color: 'warning',
        icon: 'arrow-left-right',
        onClick: fnChangeRoom,
        toolTip: IntlMessages("button.changeRoom")
      },
      {
        color: 'success',
        icon: 'box-arrow-right',
        onClick: fnDischarge,
        toolTip: IntlMessages("button.discharge")
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(buildUrl('hospital/process/events/getTable', { typeId: 2 }), (resp) => {
      const data = resp.data.map((item) => {
        item.patient = item.hospExpedient?.name || '';
        item.room = item.hospRoom?.name || '';
        item.doctor = item.responsibleSpecialist?.name || item.attendingSpecialist?.name || '';
        item.dateEvent = formatDate(item.date);
        item.daysStay = DateHelper.diff(DateHelper.now(), item.date, 'day');
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
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
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    disableTab: [false, true, true]
  }

  const dataModalDetail = {
    setLoading,
    currentItem,
    listAreas,
    listStores
  }

  const dataModalRoom = {
    setLoading,
    currentItem,
    listRooms,
    fnGetData
  }

  const propsToMsgDischarge = {
    title: "page.hospitalizations.alert.question.discharge.title",
    open: openMsgDischarge,
    setOpen: setOpenMsgDischarge,
    fnOnOk: fnOkDischarge,
    fnOnNo: () => { setCurrentItem({}) }
  };

  return (
    {
      propsToControlPanel,
      table,
      openModalDetail,
      setOpenModalDetail,
      dataModalDetail,
      openModalRoom,
      setOpenModalRoom,
      dataModalRoom,
      propsToMsgDischarge
    }
  )
}
