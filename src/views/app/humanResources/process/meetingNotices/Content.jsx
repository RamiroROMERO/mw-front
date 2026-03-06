import React from 'react'
import { useMeetingNotices } from './useMeetingNotices';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from '@Components/modal';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@Components/reactTable";
import DetailMeeting from './DetailMeeting';
import { useDetailTable } from './useDetailTable';

const Content = ({ setLoading, screenControl }) => {

  const {propsToDetailMeeting, propsToDetailTable, propsToMsgDelete, propsToViewPDF} = useMeetingNotices({setLoading, screenControl});

  const {table} = useDetailTable({...propsToDetailTable});

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={12} lg={5}>
          <DetailMeeting {...propsToDetailMeeting}/>
        </Colxx>
        <Colxx xxs={12} xs={12} sm={12} md={12} lg={7}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
      <Modal {...propsToViewPDF}/>
    </>
  )
}

export default Content