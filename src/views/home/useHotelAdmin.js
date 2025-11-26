import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import ModalAddRes from '../app/hotelManagement/process/reservations/ModalAddRes';

const useHotelAdmin = ({setLoading}) => {
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [currentReservation, setCurrentReservation] = useState({});
  const [listCustomers, setListCustomers] = useState([]);
  const [listStatusBooking, setListStatusBooking] = useState([]);
  const [listStatusPayment, setListStatusPayment] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [listPaymentTypes, setListPaymenTypes] = useState([]);
  const [listBookingChannels, setListBookingChannels] = useState([]);
  const [listRooms, setListRooms] = useState([]);

  const fnCreateReservation = () => {
    setCurrentReservation({});
    setOpenModalAdd(true);
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

  const propsToModalAddReservation = {
    ModalContent: ModalAddRes,
    title: "page.hotel.modal.reservation.title",
    open: openModalAdd,
    setOpen: setOpenModalAdd,
    maxWidth: 'xl',
    data: {
      currentReservation,
      listCustomers,
      listStatusBooking,
      listStatusPayment,
      listServices,
      listPaymentTypes,
      listBookingChannels,
      listRooms,
      setLoading,
      fnGetRooms
    }
  }

  return (
    {
      propsToModalAddReservation,
      fnCreateReservation
    }
  )
}

export default useHotelAdmin