import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import DetailProject from './DetailProject'
import { useProjects } from './useProjects'
import ModalDetail from './ModalDetail'
import ModalMoveEmployees from './ModalMoveEmployees'
import { useDetailTable } from './useDetailTable'

const Projects = ({ setLoading, screenControl, adminControl }) => {

  const {currentItem, openModalDetail, openModalMoveEmployees, listCustomers, listEmployees, listProjects, listWorkShifts, setOpenModalDetail, setOpenModalMoveEmployees, propsToDetailProject, propsToDetailTable, propsToMsgDelete, fnGetProjects} = useProjects({setLoading, screenControl, adminControl});

  const {table} = useDetailTable({...propsToDetailTable});

  const propsToModalDetail = {
    title: 'page.projects.dialog.detail.title',
    ModalContent: ModalDetail,
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      currentItem,
      listWorkShifts,
      listEmployees,
      setLoading,
      screenControl,
      fnGetProjects
    }
  };

  const propsToModalMoveEmployees = {
    title: 'page.projects.dialog.moveEmployees.title',
    ModalContent: ModalMoveEmployees,
    open: openModalMoveEmployees,
    setOpen: setOpenModalMoveEmployees,
    maxWidth: 'lg',
    data: {
      listWorkShifts,
      listProjects,
      listCustomers,
      setLoading,
      fnGetProjects
    }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12" xl="5">
          <DetailProject {...propsToDetailProject} />
        </Colxx>
        <Colxx xxs="12" xl="7">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalDetail}/>
      <Modal {...propsToModalMoveEmployees}/>
    </>
  )
}

export default Projects