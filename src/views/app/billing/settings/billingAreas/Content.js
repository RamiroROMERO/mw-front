import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import useBillingAreas from './useBillingAreas';
import BillingAreasDetail from './BillingAreasDetail';
import ControlPanel from '@Components/controlPanel';
import { Separator } from '@Components/common/CustomBootstrap';
import Modal from "@/components/modal";
import ModalViewDocuments from './ModalViewDocuments';

const BillingAreas = (props) => {
  const { setLoading } = props;

  const { tableData, propsToMsgDelete, openModalViewDocument, setOpenModalViewDocument, propsToControlPanel, propsToAreasDetail, fnViewDocument } = useBillingAreas({ setLoading });

  const propsToModalViewDoc = {
    ModalContent: ModalViewDocuments,
    title: "page.customers.modal.modalViewCust.title",
    open: openModalViewDocument,
    setOpen: setOpenModalViewDocument,
    maxWidth: 'lg',
    data: {
      tableData,
      fnViewDocument
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-3" />
              <BillingAreasDetail {...propsToAreasDetail} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalViewDoc} />
    </>
  );
}
export default BillingAreas;