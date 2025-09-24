import ReactTable from "@Components/reactTable";
import Modal from '@Components/modal';
import { Row } from 'reactstrap';
import { useRooms } from './useRooms'
import { Colxx } from '@/components/common/CustomBootstrap';
import ModalNewRooms from './ModalNewRooms';
import ModalViewRooms from "./ModalViewRooms";

const Content = ({setLoading}) => {

  const {table, currentItem, listLevels, listTypes, listServices, listStatus, listMealPlan, dataRoomServices, dataRoomImages, descriptionRoom, openModalNew, openModalViewRoom, setOpenModalNew, setOpenModalViewRoom, fnGetData, fnGetRoomImages} = useRooms({setLoading});

  const propsToModalNewRooms = {
    ModalContent: ModalNewRooms,
    title: "page.hotel.modal.addRooms.title",
    open: openModalNew,
    setOpen: setOpenModalNew,
    maxWidth: 'lg',
    data: {
      currentItem,
      listLevels,
      listTypes,
      listServices,
      listStatus,
      listMealPlan,
      dataRoomServices,
      dataRoomImages,
      setLoading,
      fnGetData,
      fnGetRoomImages
    }
  }

  const propsToModalViewRoom = {
    ModalContent: ModalViewRooms,
    title: "page.hotel.modal.viewRooms.title",
    valueTitle: descriptionRoom,
    open: openModalViewRoom,
    setOpen: setOpenModalViewRoom,
    maxWidth: 'lg',
    data: {
      dataRoomImages
    }
  }

  return (
    <>
    <Row>
      <Colxx xxs={12}>
        <ReactTable {...table} />
      </Colxx>
    </Row>
    <Modal {...propsToModalNewRooms}/>
    <Modal {...propsToModalViewRoom}/>
    </>
  )
}

export default Content