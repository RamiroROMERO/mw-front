import CardBooking from '@/components/cards/CardBooking'
import Modal from '@Components/modal';
import { Colxx } from '@/components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useReservation } from './useReservation'
import PaginationBackend from '@/components/reactTable/PaginationBackend'
import ModalAddRes from './ModalAddRes'

const Content = ({setLoading, screenControl}) => {

  const {idRoom, dataRooms, currentPage, currentReservation, totalPages, descriptionRoom, currentRoom, search, listCustomers, listStatusBooking, listStatusPayment, listServices, listPaymentTypes, listBookingChannels, openModalAdd, setOpenModalAdd, setCurrentPage, fnAddReservation, fnViewDetail, fnGetData} = useReservation({setLoading, screenControl});

  const propsToModalAddReservation = {
    ModalContent: ModalAddRes,
    title: "page.hotel.modal.viewRooms.title",
    valueTitle: descriptionRoom,
    open: openModalAdd,
    setOpen: setOpenModalAdd,
    maxWidth: 'xl',
    data: {
      idRoom,
      currentRoom,
      currentPage,
      currentReservation,
      search,
      listCustomers,
      listStatusBooking,
      listStatusPayment,
      listServices,
      listPaymentTypes,
      listBookingChannels,
      setLoading,
      descriptionRoom,
      fnGetData
    }
  }

  return (
    <>
      <Row>
        {
          dataRooms.map((item, idx) =>
            <Colxx xxs={12} md={6} lg={4} key={idx}>
              <CardBooking
                id={item.id}
                image={item.imageSrc}
                status={item.statusName}
                name={item.name}
                type={item.typeName}
                description={item.description}
                capacity={item.capacity}
                bedNumber={item.bedNumber}
                mealType={item.mealPlanName}
                price={item.rate}
                statusColor={item.statusColor}
                statusId={item.statusId}
                fnReserve={fnAddReservation}
                fnViewDetail={fnViewDetail}
              />
            </Colxx>
          )
        }
        </Row>
        <Row>
          <Colxx xxs={12}>
            <Card>
              <CardBody style={{padding: '1rem'}}>
                <PaginationBackend currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}/>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        <Modal {...propsToModalAddReservation}/>
    </>
  )
}

export default Content