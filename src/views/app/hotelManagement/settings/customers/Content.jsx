import ReactTable from "@Components/reactTable";
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useCustomer } from './useCustomer'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ModalNewCust from "./ModalNewCust";

const Content = ({setLoading, screenControl}) => {

  const {table, currentItem, listDepartments, listMunicipalities, propsToMsgDisable, openModalNew, setOpenModalNew, setListMunicipalities, fnGetData} = useCustomer({setLoading, screenControl});

  const propsToModalNewCustomer = {
    ModalContent: ModalNewCust,
    title: "page.hotel.modal.addCustomer.title",
    open: openModalNew,
    setOpen: setOpenModalNew,
    maxWidth: 'md',
    data: {
      listDepartments,
      listMunicipalities,
      currentItem,
      setLoading,
      setListMunicipalities,
      fnGetData
    }
  }

  return (
    <>
    <Row>
      <Colxx xxs={12}>
        <ReactTable {...table} />
      </Colxx>
    </Row>
    <Modal {...propsToModalNewCustomer}/>
    <Confirmation {...propsToMsgDisable}/>
    </>
  )
}

export default Content