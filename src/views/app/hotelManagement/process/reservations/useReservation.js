import { request } from '@/helpers/core';
import { useEffect, useState } from 'react'
import { PATH_FILES } from '/src/helpers/pathFiles';

export const useReservation = ({setLoading}) => {
  const [dataRooms, setDataRooms] = useState([]);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [idRoom, setIdRoom] = useState(0);
  const [descriptionRoom, setDescriptionRoom] = useState("");
  const [listCustomers, setListCustomers] = useState([]);
  const [listStatusBooking, setListStatusBooking] = useState([]);
  const [listStatusPayment, setListStatusPayment] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [listPaymentTypes, setListPaymenTypes] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({});
  const [currentReservation, setCurrentReservation] = useState({});

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3;

  const fnAddReservation = (id) => {
    const findRoom = dataRooms.find(item => item.id === id);
    const description = `${findRoom?.name || ""} ${findRoom?.typeName || ""}`;
    setCurrentRoom(findRoom);
    setDescriptionRoom(description);
    setIdRoom(id);
    setCurrentReservation({});
    setOpenModalAdd(true);
  }

  const fnViewDetail = (id) => {
    const findRoom = dataRooms.find(item => item.id === id);
    const description = `${findRoom?.name || ""} ${findRoom?.typeName || ""}`;
    setCurrentRoom(findRoom);
    setDescriptionRoom(description);
    setIdRoom(id);

    // buscar la reservacion que esta activa
    setLoading(true);
    request.GET(`hotel/process/bookings?roomId=${id}&status=1`, (resp)=>{
      const data = resp.data.map(item => {
        item.typeName = item?.typeData?.name || ""
        item.levelName = item?.levelData?.name || ""
        item.statusName = item?.statusData?.name || ""
        return item
      });
      setCurrentReservation(data[0]);
      setOpenModalAdd(true);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetData = (page=currentPage, searchText=search)=>{
    setDataRooms([]);
    setLoading(true);
    request.GET(`hotel/settings/rooms/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp)=>{
      const data = resp.data.map(item => {
        item.typeName = item?.typeData?.name || ""
        item.levelName = item?.levelData?.name || ""
        item.statusName = item?.statusData?.name || ""
        item.mealPlanName = item?.mealTypeData?.name || ""
        item.statusColor = item?.statusData?.color || ""
        return item
      });

      data.map(async (item) => {
        const nameImg = item?.roomPictures[0]?.name || "hotelroom.jpg";
        const imageUrl = `${PATH_FILES.GET.PICTURES}${nameImg}`;
        const imageObjectURL = await request.getFile(imageUrl);
        item.imageSrc = imageObjectURL
        setDataRooms((prev) => [...prev, item]);
      });
      const pageTotal = resp.pagination.totalPages;
      setTotalPages(pageTotal);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

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
          name: item.nomcli
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
  },[]);

  return (
    {
      idRoom,
      dataRooms,
      totalPages,
      currentPage,
      typePagination: 2,
      descriptionRoom,
      currentRoom,
      currentReservation,
      search,
      listCustomers,
      listStatusBooking,
      listStatusPayment,
      listServices,
      listPaymentTypes,
      openModalAdd,
      setOpenModalAdd,
      setCurrentPage,
      setSearch,
      fnAddReservation,
      fnViewDetail,
      fnGetData
    }
  )
}
