import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from '@/components/modal';
import Detail from './Detail';
import ModalSearch from './ModalSearch';
import ModalEvents from './ModalEvents';
import { usePatientFiles } from './usePatientFiles';

const Content = (props) => {
  const {setLoading} = props;

  const {propsToControlPanel, propsToDetail, openModalSearch, setOpenModalSearch, onBulkForm, setListCities, propsToMsgDelete, openModalEvents, setOpenModalEvents, dataModalEvents, fnGetEvents} = usePatientFiles({setLoading});

  const propsToModalSearch = {
    ModalContent: ModalSearch,
    title: "menu.hospitalManagement.patientFiles",
    open: openModalSearch,
    setOpen: setOpenModalSearch,
    maxWidth: 'lg',
    data:{
      setLoading,
      onBulkForm,
      setListCities,
      fnGetEvents
    }
  }

  const propsToModalEvents = {
    ModalContent: ModalEvents,
    title: "page.patientFiles.modalEvents.title",
    open: openModalEvents,
    setOpen: setOpenModalEvents,
    maxWidth: 'lg',
    data: dataModalEvents
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel}/>
              <Separator className="mt-2 mb-5" />
              <Detail {...propsToDetail}/>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalSearch}/>
      <Modal {...propsToModalEvents}/>
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;