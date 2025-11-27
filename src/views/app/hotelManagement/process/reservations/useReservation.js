import { request } from '@/helpers/core';
import { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { formatDate, IntlMessages } from '@/helpers/Utils';
import { Badge } from 'reactstrap';

export const useReservation = ({setLoading, screenControl}) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [listCustomers, setListCustomers] = useState([]);
  const [listStatusBooking, setListStatusBooking] = useState([]);
  const [listStatusPayment, setListStatusPayment] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [listPaymentTypes, setListPaymenTypes] = useState([]);
  const [listBookingChannels, setListBookingChannels] = useState([]);
  const [listRooms, setListRooms] = useState([]);
  const [currentReservation, setCurrentReservation] = useState({});

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const fnAddReservation = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentReservation({});
    setOpenModalAdd(true);
  }

  const fnViewDetail = (item) => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentReservation(item);
    setOpenModalAdd(true);
  }

  const fnGetData = (page=currentPage, searchText=search)=>{
    setLoading(true);
    request.GET(`hotel/process/bookings/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp)=>{
      const data = resp.data.map(item => {
        item.statusName = item?.statusData?.name || ""
        item.channel = item?.channelData?.name || ""
        item.room = item?.roomData?.name || ""
        item.customer = item?.customerData?.name || ""
        item.typeRoom = item?.roomData?.typeData?.name || ""
        return item
      });
      const pageTotal = resp.pagination.totalPages;
      const tableData = {
        ...table, data, options: {totalPages: pageTotal, currentPage, setCurrentPage, typePagination: 2, setSearch}
      }
      setTable(tableData);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetRooms = () => {
    setLoading(true);
    request.GET('hotel/settings/rooms', (resp) => {
      const rooms = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListRooms(rooms);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.reservations"),
    columns: [
      { text: IntlMessages("table.column.dateIn"), dataField: "checkInDate", headerStyle: { 'width': '10%' },
        cell:({row})=>{
          return (formatDate(row.original.checkInDate));
        }
      },
      { text: IntlMessages("table.column.dateOut"), dataField: "checkOutDate", headerStyle: { 'width': '10%' },
        cell:({row})=>{
          return (formatDate(row.original.checkOutDate));
        }
      },
      { text: IntlMessages("table.column.customer"), dataField: "customer", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("table.column.room"), dataField: "room", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.roomType"), dataField: "typeRoom", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.totalNights"), dataField: "totalNights", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.totalPeople"), dataField: "personQty", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.channel"), dataField: "channel", headerStyle: { 'width': '10%' } },
      {
        text: IntlMessages("table.column.statusName"), dataField: "statusName", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (<Badge
            color=''
            pill
            style={{ backgroundColor: row.original?.statusData?.color || "#2a93d5" }}
          >
            {row.original.statusName}
          </Badge>);
        }
      },
    ],
    data: [],
    options: {
      columnActions: 'options',
      typePagination: 2,
      currentPage,
      totalPages: 0,
      setCurrentPage
    },
    actions: [{
      color: 'warning',
      onClick: fnViewDetail,
      icon: 'list'
    }, {
      color: "primary",
      icon: "bi bi-plus",
      onClick: fnAddReservation,
      title: IntlMessages("button.new"),
      isFreeAction: true
    }],
  });

  useEffect(() => {
    fnGetData(currentPage, search);
  }, [currentPage, search]);

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli,
          phone: item.tel,
          email: item.email
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/bookingStatuses', (resp) => {
      const bookingStatuses = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListStatusBooking(bookingStatuses);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/bookingPayStatuses', (resp) => {
      const bookingPayStatuses = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListStatusPayment(bookingPayStatuses);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/products', (resp) => {
      const products = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListServices(products);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/paymentTypes', (resp) => {
      const paymentTypes = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListPaymenTypes(paymentTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/bookingChannels', (resp) => {
      const bookingChannels = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListBookingChannels(bookingChannels);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    fnGetRooms();

  },[]);

  return (
    {
      currentPage,
      currentReservation,
      search,
      table,
      listCustomers,
      listStatusBooking,
      listStatusPayment,
      listServices,
      listPaymentTypes,
      listBookingChannels,
      listRooms,
      openModalAdd,
      setOpenModalAdd,
      setSearch,
      fnGetData,
      fnGetRooms
    }
  )
}
