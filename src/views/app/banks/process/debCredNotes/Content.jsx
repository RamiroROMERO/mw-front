import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useDebCredNotes } from './useDebCredNotes';
import { UseDebCredNotesForm } from './UseDebCredNotesForm';
import { ModalViewDebCredNote } from './ModalViewDebCredNote';

const DebCredNotes = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount,
    formValidationIndex, sendForm, openModalView, setOpenModalView, dataList, fnViewNote,
    propsToMsgDelete
  } = useDebCredNotes({ setLoading });

  const propsToForm = {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount, formValidationIndex, sendForm
  }

  const propsToModalView = {
    ModalContent: ModalViewDebCredNote,
    title: "page.debCredNotes.modal.title.view",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewNote }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <UseDebCredNotesForm {...propsToForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default DebCredNotes;
