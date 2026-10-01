import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import { useCheckRequest } from './useCheckRequest';
import { RequestForm } from './RequestForm';
import { RequestDetail } from './RequestDetail';
import { FooterForm } from './FooterForm';
import { ModalAccountPayable } from './ModalAccountPayable';
import { ModalViewRequest } from './ModalViewRequest';

const CheckRequest = ({ setLoading }) => {
  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listProvider, formValidationIndex, sendForm,
    isTransfer, providerAccountOptions, onSelectProviderAccount, lines, fnUpdateLine, fnRemoveLine, fnOpenCxpPicker, openModalCxp, setOpenModalCxp,
    pendingCxp, fnApplyCxp, openModalView, setOpenModalView, dataList, fnViewRequest, propsToMsgDelete
  } = useCheckRequest({ setLoading });

  const propsToRequestForm = { formStateIndex, onInputChangeIndex, listProvider, formValidationIndex, sendForm, isTransfer, providerAccountOptions, onSelectProviderAccount };
  const propsToRequestDetail = { lines, fnUpdateLine, fnRemoveLine, fnOpenCxpPicker, formStateIndex, onInputChangeIndex };
  const propsToFooterForm = { formStateIndex, onInputChangeIndex, formValidationIndex, sendForm };

  const propsToModalCxp = {
    ModalContent: ModalAccountPayable,
    title: 'page.checkRequest.modal.billToPay.title',
    open: openModalCxp,
    setOpen: setOpenModalCxp,
    maxWidth: 'lg',
    data: { pendingCxp, fnApplyCxp }
  }

  const propsToModalView = {
    ModalContent: ModalViewRequest,
    title: 'page.checkRequest.modal.checkRequest.title',
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewRequest }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <RequestForm {...propsToRequestForm} />
              <RequestDetail {...propsToRequestDetail} />
              <FooterForm {...propsToFooterForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalCxp} />
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CheckRequest;
