import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import ModalAddRes from '../app/hotelManagement/process/reservations/ModalAddRes';
import ModalNewCust from '../app/hotelManagement/settings/customers/ModalNewCust';

const useHotelAdmin = ({ setLoading }) => {
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [currentReservation, setCurrentReservation] = useState({});
  const [listCustomers, setListCustomers] = useState([]);
  const [listStatusBooking, setListStatusBooking] = useState([]);
  const [listStatusPayment, setListStatusPayment] = useState([]);
  const [listServices, setListServices] = useState([]);
  const [listPaymentTypes, setListPaymenTypes] = useState([]);
  const [listBookingChannels, setListBookingChannels] = useState([]);
  const [listRooms, setListRooms] = useState([]);

  // data for Create customer.
  const [listCountries, setListCountries] = useState([]);
  const [listCompanies, setListCompanies] = useState([]);
  const [listGenders, setListGenders] = useState([]);
  const [listTypeTax, setListTypeTax] = useState([]);

  const [openModalCreateCustomer, setOpenModalCreateCustomer] = useState(false);

  const fnCreateReservation = () => {
    setCurrentReservation({});
    setOpenModalAdd(true);
  }

  const fnCreateCustomer = () => {
    setOpenModalCreateCustomer(true);
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
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('billing/settings/customers?status=1', (resp) => {
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
      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/bookingStatuses?type=1', (resp) => {
      const bookingStatuses = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListStatusBooking(bookingStatuses);
      setLoading(false);
    }, (err) => {
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
      setLoading(false);
    });

    fnGetRooms();

  }, []);

  // data for modal new customer
  useEffect(() => {
    request.GET('admin/countries/getSl', (resp) => {
      const countries = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListCountries(countries);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    request.GET('rrhh/settings/genders/getSl', (resp) => {
      const genders = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListGenders(genders);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    request.GET('admin/taxTypes/getSl', (resp) => {
      const taxTypes = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListTypeTax(taxTypes);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    request.GET('hotel/settings/customers/getSl?typeId=1', (resp) => {
      const customer = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListCompanies(customer);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

  }, []);

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

  const propsToModalAddCustomer = {
    ModalContent: ModalNewCust,
    title: "page.hotel.modal.addCustomer.title",
    open: openModalCreateCustomer,
    setOpen: setOpenModalCreateCustomer,
    maxWidth: 'lg',
    data: {
      listCountries,
      listCompanies,
      listGenders,
      listTypeTax,
      currentItem: null,
      setLoading,
      fnGetData: () => { }
    }
  }

  return (
    {
      propsToModalAddReservation,
      fnCreateReservation,
      fnCreateCustomer,
      propsToModalAddCustomer,
      setCurrentReservation,
      setOpenModalAdd,
    }
  )
}

export default useHotelAdmin