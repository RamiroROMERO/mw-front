import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import moment from 'moment';
import { useEffect, useState } from 'react'
import createNotification from "@/containers/ui/Notifications";

export const useModalAddRes = ({ currentReservation, setLoading, currentPage = null, search = null, fnGetData = null, setOpen, listCustomers, listRooms, fnGetRooms }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [sendForm, setSendForm] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [currentService, setCurrentService] = useState({});
  const [currentPayment, setCurrentPayment] = useState({});
  const [currentRoom, setCurrentRoom] = useState({});
  const [dataServices, setDataServices] = useState([]);
  const [dataPayments, setDataPayments] = useState([]);
  const [roomsAvailables, setRoomsAvailables] = useState([]);
  const [totalValServices, setTotalValServices] = useState(0);
  const [totalValPayments, setTotalValPayments] = useState(0);
  const [openModalAddService, setOpenModalAddService] = useState(false);
  const [openModalAddPayment, setOpenModalAddPayment] = useState(false);
  const [openMsgDeleteService, setOpenMsgDeleteService] = useState(false);
  const [openMsgDeletePayment, setOpenMsgDeletePayment] = useState(false);

  const validation = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val) => validFloat(val) > 0, "msg.required.select.customer"],
    roomId: [(val) => validFloat(val) > 0, "msg.required.select.room"],
    checkInDate: [(val) => val !== "", "msg.required.input.checkInDate"],
    checkOutDate: [(val) => val !== "", "msg.required.input.checkOutDate"],
    statusId: [(val) => validFloat(val) > 0, "msg.required.select.statusId"],
    totalNights: [(val) => validFloat(val) > 0, "msg.required.input.totalNights"],
    baseRate: [(val) => validFloat(val) > 0, "msg.required.input.baseRate"],
    paymentStatusId: [(val) => validFloat(val) > 0, "msg.required.select.paymentStatusId"],
    qtyAdults: [(val) => validFloat(val) > 0 && validFloat(val) <= validInt(currentRoom.capacity), "msg.required.input.qtyAdults"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentReservation?.id || 0,
    date: currentReservation?.date || "",
    customerId: currentReservation?.customerId || 0,
    roomId: currentReservation?.roomId || 0,
    checkInDate: currentReservation?.checkInDate || "",
    checkOutDate: currentReservation?.checkOutDate || "",
    personQty: currentReservation?.personQty || 0,
    statusId: currentReservation?.statusId || 0,
    totalNights: currentReservation?.totalNights || 0,
    baseRate: currentReservation?.baseRate || currentRoom?.rate || 0,
    totalCost: currentReservation?.baseRate || currentRoom?.rate || 0,
    qtyAdults: currentReservation?.qtyAdults || 0,
    qtyChild: currentReservation?.qtyChild || 0,
    others: currentReservation?.others || "",
    notes: currentReservation?.notes || "",
    paymentStatusId: currentReservation?.paymentStatusId || 0,
    channelId: currentReservation?.channelId || 0
  }, validation);

  const { id, checkInDate, checkOutDate, baseRate, statusId, paymentStatusId, customerId, roomId } = formState;

  const onCustomerChange = e => {
    const custId = validInt(e.target.value);

    onBulkForm({ customerId: custId });
  }

  const onRoomChange = e => {
    const roomId = e.target.value;

    onBulkForm({ roomId });
  }

  const onCheckInDate = e => {
    const dateValue = e.target.value;

    const date1 = moment(dateValue);
    const date2 = moment(checkOutDate);
    const daysDiff = date2.diff(date1, 'days');

    const totalCost = (validInt(daysDiff) * validFloat(baseRate)) + validFloat(totalValServices);

    const newOutDate = {
      totalNights: validInt(daysDiff),
      checkInDate: dateValue,
      totalCost
    }
    onBulkForm(newOutDate);
  }

  const onCheckOutDate = e => {
    const dateValue = e.target.value;

    const date1 = moment(checkInDate);
    const date2 = moment(dateValue);
    const daysDiff = date2.diff(date1, 'days');

    const totalCost = (validInt(daysDiff) * validFloat(baseRate)) + validFloat(totalValServices);

    const newOutDate = {
      totalNights: validInt(daysDiff),
      checkOutDate: dateValue,
      totalCost
    }
    onBulkForm(newOutDate);
  }

  const onBaseRateChange = e => {
    const valueRate = e.target.value;

    const date1 = moment(checkInDate);
    const date2 = moment(checkOutDate);
    const daysDiff = date2.diff(date1, 'days');

    const totalCost = (validInt(daysDiff) * validFloat(valueRate)) + validFloat(totalValServices);

    const newOutDate = {
      baseRate: e.target.value,
      totalCost
    }
    onBulkForm(newOutDate);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    const totalPeople = validInt(formState.qtyAdults) + validInt(formState.qtyChild);

    formState.personQty = totalPeople;
    formState.status = 1;

    if(validInt(formState.qtyAdults) > validInt(currentRoom?.capacity)){
      createNotification('warning', 'msg.required.input.qtyAdults', 'alert.warning.title');
      return
    }

    if (validInt(id) === 0) {
      setLoading(true);
      request.POST('hotel/process/bookings', formState, (resp) => {
        const { data } = resp;
        onBulkForm(data);
        setLoading(false);

        //actualizar status de la habitacion
        const dataUpdate = {
          statusId: 3
        }

        setLoading(true);
        request.PUT(`hotel/settings/rooms/${roomId}`, dataUpdate, () => {
          setLoading(false);
          if (fnGetData) fnGetData(currentPage, search);
          fnGetRooms();
        }, (err) => {
          setLoading(false);
        }, false);

        //calendarizar reserva si el status es 5-Check-IN
        if (statusId === 5) {
          const dataCalendar = {
            bookingId: data.id
          }

          setLoading(true);
          request.POST('hotel/process/calendarBooking/programBooking', dataCalendar, (resp) => {
            setLoading(false);
          }, (err) => {
            setLoading(false);
          })
        }

      }, (err) => {
        setLoading(false);
      })
      setOpen(false);
    } else {
      setLoading(true);
      request.PUT(`hotel/process/bookings/${id}`, formState, () => {
        setLoading(false);
        if (fnGetData) fnGetData(currentPage, search);
        fnGetRooms();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnGetDataServices = () => {
    setLoading(true);
    request.GET(`hotel/process/bookingCharges?bookingId=${id}`, (resp) => {
      const bookingCharges = resp.data.map((item) => {
        item.service = item?.serviceData?.name || ""
        item.priceTotal = validFloat(item.price) + validFloat(item.price * (item.taxPercent / 100))
        return item;
      });
      setDataServices(bookingCharges);
      const sumTotal = bookingCharges.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
      setTotalValServices(sumTotal);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetDataPayments = () => {
    setLoading(true);
    request.GET(`hotel/process/bookingPayments?bookingId=${id}`, (resp) => {
      const bookingPayments = resp.data.map((item) => {
        item.type = item?.paymentTypeData?.name || ""
        return item;
      });
      setDataPayments(bookingPayments);
      const sumTotal = bookingPayments.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
      setTotalValPayments(sumTotal);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveStatus = () => {
    const dataUpdate = {
      statusId,
      status: 1
    }

    if (statusId === 3 || statusId === 6 || statusId === 7) {
      dataUpdate.status = 0
    }

    setLoading(true);
    request.PUT(`hotel/process/bookings/${id}`, dataUpdate, () => {
      setLoading(false);

      //actualizar status de la habitacion si la reservacion fue 3-cancelada, 6-check-out, 7-no se presento
      if (statusId === 3 || statusId === 6 || statusId === 7) {
        const dataUpdate = {
          statusId: 1
        }

        setLoading(true);
        request.PUT(`hotel/settings/rooms/${roomId}`, dataUpdate, () => {
          setLoading(false);
          if (fnGetData) fnGetData(currentPage, search);
        }, (err) => {
          setLoading(false);
        }, false);
        setOpen(false);
      }

      //calendarizar reserva si el status es 5-Check-IN
      if (statusId === 5) {
        const dataCalendar = {
          bookingId: id
        }

        setLoading(true);
        request.POST('hotel/process/calendarBooking/programBooking', dataCalendar, (resp) => {
          if (fnGetData) fnGetData(currentPage, search);
          setLoading(false);
        }, (err) => {
          setLoading(false);
        })
      }

    }, (err) => {
      setLoading(false);
    })
    setOpen(false);
  }

  const fnSavePayment = () => {
    const dataUpdate = {
      paymentStatusId
    }
    setLoading(true);
    request.PUT(`hotel/process/bookings/${id}`, dataUpdate, () => {
      setLoading(false);
    }, (err) => {
      setLoading(false);
    })
  }

  const fnAddPayment = () => {
    setCurrentPayment({});
    setOpenModalAddPayment(true);
  }

  const fnAddService = () => {
    setCurrentService({});
    setOpenModalAddService(true);
  }

  const fnDeleteService = (item) => {
    setCurrentService(item);
    setOpenMsgDeleteService(true);
  }

  const fnOkDeleteService = () => {
    setLoading(true);
    request.DELETE(`hotel/process/bookingCharges/${currentService.id}`, () => {
      fnGetDataServices();
      setCurrentService({});
      setOpenMsgDeleteService(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDeletePayment = (item) => {
    setCurrentPayment(item);
    setOpenMsgDeletePayment(true);
  }

  const fnOkDeletePayment = () => {
    setLoading(true);
    request.DELETE(`hotel/process/bookingPayments/${currentPayment.id}`, () => {
      fnGetDataPayments();
      setCurrentPayment({});
      setOpenMsgDeletePayment(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const propsToMsgDeleteService = {
    open: openMsgDeleteService,
    setOpen: setOpenMsgDeleteService,
    fnOnOk: fnOkDeleteService,
    title: "alert.question.title",
    fnOnNo: () => setCurrentService({})
  }

  const propsToMsgDeletePayment = {
    open: openMsgDeletePayment,
    setOpen: setOpenMsgDeletePayment,
    fnOnOk: fnOkDeletePayment,
    title: "alert.question.title",
    fnOnNo: () => setCurrentPayment({})
  }

  useEffect(() => {
    fnGetDataServices();
    fnGetDataPayments();
    const filterRooms = listRooms.filter(item => item.statusId === 1);
    setRoomsAvailables(filterRooms);
  }, []);

  useEffect(() => {
    const filter = listCustomers.find(item => item.id === customerId);
    setCustomerPhone(filter?.phone || "");
    setCustomerEmail(filter?.email || "");
  }, [customerId]);

  useEffect(() => {
    const filter = listRooms.find(item => item.id === roomId);
    setLoading(true);
    request.GET(`hotel/settings/roomServices?roomId=${roomId}`, (resp) => {
      const data = resp.data;
      if (filter) {
        filter.roomServices = data;
      }

      const date1 = moment(checkInDate);
      const date2 = moment(checkOutDate);
      const daysDiff = date2.diff(date1, 'days');

      const totalCost = (validInt(daysDiff) * validFloat(filter?.rate || 0)) + validFloat(totalValServices);

      const newdata = {
        baseRate: filter?.rate || 0,
        totalCost
      }

      onBulkForm(newdata);

      setCurrentRoom(filter);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, [roomId]);

  return (
    {
      formState,
      formValidation,
      sendForm,
      customerEmail,
      customerPhone,
      currentPayment,
      currentService,
      currentRoom,
      dataServices,
      dataPayments,
      roomsAvailables,
      totalValServices,
      totalValPayments,
      activeTab,
      propsToMsgDeleteService,
      propsToMsgDeletePayment,
      openModalAddPayment,
      openModalAddService,
      setActiveTab,
      setOpenModalAddPayment,
      setOpenModalAddService,
      onCustomerChange,
      onRoomChange,
      onInputChange,
      onCheckInDate,
      onCheckOutDate,
      onBaseRateChange,
      fnSave,
      fnSaveStatus,
      fnSavePayment,
      fnAddPayment,
      fnAddService,
      fnGetDataPayments,
      fnGetDataServices,
      fnDeleteService,
      fnDeletePayment
    }
  )
}
