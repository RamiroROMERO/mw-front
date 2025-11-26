import Modal from '@Components/modal';
import ReactTable from "@Components/reactTable";
import { Colxx } from '@/components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { useReservation } from './useReservation'
import ModalAddRes from './ModalAddRes'

const Content = ({setLoading, screenControl}) => {

  const {currentPage, currentReservation, descriptionRoom, search, table, listCustomers, listStatusBooking, listStatusPayment, listServices, listPaymentTypes, listBookingChannels, listRooms, openModalAdd, setOpenModalAdd, fnGetData, fnGetRooms} = useReservation({setLoading, screenControl});

  const propsToModalAddReservation = {
    ModalContent: ModalAddRes,
    title: "page.hotel.modal.viewRooms.title",
    valueTitle: descriptionRoom,
    open: openModalAdd,
    setOpen: setOpenModalAdd,
    maxWidth: 'xl',
    data: {
      currentPage,
      currentReservation,
      search,
      listCustomers,
      listStatusBooking,
      listStatusPayment,
      listServices,
      listPaymentTypes,
      listBookingChannels,
      listRooms,
      setLoading,
      descriptionRoom,
      fnGetData,
      fnGetRooms
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs={12}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalAddReservation}/>
    </>
  )
}

export default Content