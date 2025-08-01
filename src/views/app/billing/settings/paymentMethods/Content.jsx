import React from 'react';
import Modal from '@Components/modal';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { usePaymentMethods } from './usePaymentMethods';
import { ModalDetail } from './ModalDetail';
import { useDetailTable } from './useDetailTable';
import Detail from './Detail';

const PaymentMethods = (props) => {
  const { setLoading } = props;

  const { recordId, propsToMsgDelete, propsToDetail, propsToDetailTable, openModalDetail, setOpenModalDetail } = usePaymentMethods({ setLoading });

  const {table} = useDetailTable({...propsToDetailTable});

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: "page.paymentMethods.modal.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      selectedItem: recordId,
      setLoading
    }
  }

  return (
    <>
      <Row>
        <Colxx className='mb-3' xxs="12" lg="6">
          <Detail {...propsToDetail}/>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Modal {...propsToModalDetail} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default PaymentMethods;