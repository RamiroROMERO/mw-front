import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from "@Components/reactTable";
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { InternalOptionsModal } from './InternalOptionsModal';
import { MailOptionsModal } from './MailOptionsModal';
import { useCompanyInf } from './useCompanyInf';
import Detail from './Detail';
import { useDetailTable } from './useDetailTable';

const CompanyInformation = (props) => {
  const { setLoading } = props;

  const {companyId, propsToDetail, propsToDetailTable, propsToMsgDelete, openInternalOptionsModal, openMailOptionsModal, setOpenInternalOptionsModal, setOpenMailOptionsModal} = useCompanyInf({setLoading});

  const {table} = useDetailTable({...propsToDetailTable});

  const propsToModalInternalOptions = {
    ModalContent: InternalOptionsModal,
    title: "page.companyInformation.modal.availableMenus",
    open: openInternalOptionsModal,
    setOpen: setOpenInternalOptionsModal,
    maxWidth: 'md',
    data: {
      companyId,
      setLoading
    }
  };
  const propsToModalMailOptions = {
    ModalContent: MailOptionsModal,
    title: "page.companyInformation.modal.mailOptions",
    open: openMailOptionsModal,
    setOpen: setOpenMailOptionsModal,
    maxWidth: 'lg',
    data: {
      companyId,
      setLoading
    }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs="12">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Modal {...propsToModalInternalOptions} />
      <Modal {...propsToModalMailOptions} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CompanyInformation;