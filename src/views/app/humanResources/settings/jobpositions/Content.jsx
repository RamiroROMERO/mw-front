import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import DetailJobPosition from './DetailJobPosition';
import LevelForm from './ModalLevelForm';
import ReactTable from '@Components/reactTable';
import { useJobPositions } from './useJobPositions';
import useDetailTable from './useDetailTable';

const JobPositions = (props) => {
  const { setLoading, screenControl } = props;

  const {propsToMsgDelete, propsToDetailJobPosition, propsToDetailTable, openModalLevel, setOpenModalLevel, fnLevels} = useJobPositions({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  const propsToModalLevel = {
    ModalContent: LevelForm,
    title: "page.jobPosition.modal.form.title",
    open: openModalLevel,
    setOpen: setOpenModalLevel,
    maxWidth: 'md',
    data: {
      fnCreate: screenControl.fnCreate,
      setLoading,
      fnLevels
    }
  }

  return (
    <>
      <Row>
        <Colxx xss="12" lg="6">
          <DetailJobPosition {...propsToDetailJobPosition} />
        </Colxx>
        <Colxx xss="12" lg="6">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalLevel} />
    </>
  );
}

export default JobPositions;