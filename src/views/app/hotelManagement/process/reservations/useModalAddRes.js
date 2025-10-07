import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useEffect, useState } from 'react'

export const useModalAddRes = ({currentReservation, setLoading, idRoom, currentPage, search, fnGetData, rate, setOpen}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [sendForm, setSendForm] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [currentService, setCurrentService] = useState({});
  const [currentPayment, setCurrentPayment] = useState({});
  const [dataServices, setDataServices] = useState([]);
  const [dataPayments, setDataPayments] = useState([]);
  const [totalValServices, setTotalValServices] = useState(0);
  const [totalValPayments, setTotalValPayments] = useState(0);
  const [openModalAddService, setOpenModalAddService] = useState(false);
  const [openModalAddPayment, setOpenModalAddPayment] = useState(false);
  const [openMsgDeleteService, setOpenMsgDeleteService] = useState(false);
  const [openMsgDeletePayment, setOpenMsgDeletePayment] = useState(false);

  const validation = {
    date: [(val) => val !== "", "msg.required.input.date"],
    customerId: [(val)=>validFloat(val)>0, "msg.required.select.customer"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentReservation?.id || 0,
    date: currentReservation?.date || "",
    customerId: currentReservation?.customerId || 0,
    roomId: currentReservation?.roomId || idRoom,
    checkInDate: currentReservation?.checkInDate || "",
    checkOutDate: currentReservation?.checkOutDate || "",
    personQty: currentReservation?.personQty || 0,
    statusId: currentReservation?.statusId || 0,
    totalNights: currentReservation?.totalNights || 0,
    baseRate: currentReservation?.baseRate || rate,
    qtyAdults: currentReservation?.qtyAdults || 0,
    qtyChild: currentReservation?.qtyChild || 0,
    others: currentReservation?.others || "",
    notes: currentReservation?.notes || "",
    paymentStatusId: currentReservation?.paymentStatusId || 0
  }, validation);

  const {id, statusId, paymentStatusId} = formState;

  const onCustomerChange = e => {
    const custId = validInt(e.target.value);

    onBulkForm({customerId: custId});
  }

  const fnSave = () => {
    setSendForm(true);
    if(!isFormValid){
      return;
    }
    const totalPeople = validInt(formState.qtyAdults) + validInt(formState.qtyChild);

    formState.personQty = totalPeople;
    formState.status = 1;

    if (validInt(id) === 0) {
      // if (fnCreate === false) {
      //   notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      //   return;
      // }
      setLoading(true);
      request.POST('hotel/process/bookings', formState, (resp) => {
        const {data} = resp;
        onBulkForm(data);
        setLoading(false);

        //actualizar status de la habitacion
        const dataUpdate = {
          statusId: 3
        }

        setLoading(true);
        request.PUT(`hotel/settings/rooms/${idRoom}`, dataUpdate, () => {
          setLoading(false);
          fnGetData(currentPage, search);
        }, (err) => {
          console.log(err);
          setLoading(false);
        }, false);

      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      // if (fnUpdate === false) {
      //   notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      //   return;
      // }
      setLoading(true);
      request.PUT(`hotel/process/bookings/${id}`, formState, () => {
        setLoading(false);
        fnGetData(currentPage, search);
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  const fnGetDataServices = () => {
    setLoading(true);
    request.GET(`hotel/process/bookingCharges?bookingId=${id}`, (resp) => {
      const bookingCharges = resp.data.map((item) => {
        item.service = item?.serviceData?.name || ""
        item.priceTotal = validFloat(item.price) + validFloat(item.price * (item.taxPercent/100))
        return item;
      });
      setDataServices(bookingCharges);
      const sumTotal = bookingCharges.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
      setTotalValServices(sumTotal);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveStatus = () => {
    const dataUpdate = {
      statusId,
      status: 1
    }

    if(statusId===3 || statusId===6 || statusId===7){
      dataUpdate.status = 0
    }

    setLoading(true);
    request.PUT(`hotel/process/bookings/${id}`, dataUpdate, () => {
      setLoading(false);

      //actualizar status de la habitacion si la reservacion fue 3-cancelada, 6-check-out, 7-no se presento
      if(statusId===3 || statusId===6 || statusId===7){
        const dataUpdate = {
          statusId: 1
        }

        setLoading(true);
        request.PUT(`hotel/settings/rooms/${idRoom}`, dataUpdate, () => {
          setLoading(false);
          fnGetData(currentPage, search);
        }, (err) => {
          console.log(err);
          setLoading(false);
        }, false);
        setOpen(false);
      }
    }, (err) => {
      console.log(err);
      setLoading(false);
    })
  }

  const fnSavePayment = () => {
    const dataUpdate = {
      paymentStatusId
    }
    setLoading(true);
    request.PUT(`hotel/process/bookings/${id}`, dataUpdate, () => {
      setLoading(false);
    }, (err) => {
      console.log(err);
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnDeletePayment = (item) => {
    setCurrentPayment(item);
    setOpenMsgDeletePayment(true);
  }

  const fnOkDeletePayment = () => {
    setLoading(true);
    request.DELETE(`hotel/process/bookingPayments/${currentService.id}`, () => {
      fnGetDataPayments();
      setCurrentPayment({});
      setOpenMsgDeletePayment(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
  }, []);

  return (
    {
      formState,
      formValidation,
      sendForm,
      customerEmail,
      customerPhone,
      currentPayment,
      currentService,
      dataServices,
      dataPayments,
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
      onInputChange,
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
