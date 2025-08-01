import React from 'react';
import {Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import ReactTable from '@/components/reactTable';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from '@/components/modal';
import { useEvents } from './useEvents';
import ModalEvents from '../patientFiles/ModalEvents';
import ModalDetail from './ModalDetail';
import ModalHospitalization from './ModalHospitalization';

const Content = (props) => {
  const {setLoading} = props;

  const {propsToControlPanel, table, dataModalEvents, openModalEvents, setOpenModalEvents, openModalDetail, setOpenModalDetail, dataModalDetail, openModalHosp, setOpenModalHosp, dataModalHosp, propsToMsgDelete} = useEvents({setLoading});

  const propsToModalEvents = {
    ModalContent: ModalEvents,
    title: "page.patientFiles.modalEvents.title",
    open: openModalEvents,
    setOpen: setOpenModalEvents,
    maxWidth: 'lg',
    data: dataModalEvents
  }

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: "page.events.modalDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: dataModalDetail
  }

  const propsToModalHosp = {
    ModalContent: ModalHospitalization,
    title: "page.events.modalHospitalization.title",
    open: openModalHosp,
    setOpen: setOpenModalHosp,
    maxWidth: 'lg',
    data: dataModalHosp
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel}/>
              <Separator className="mt-2 mb-2" />
              <ReactTable {...table}/>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalEvents}/>
      <Modal {...propsToModalDetail}/>
      <Modal {...propsToModalHosp}/>
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;