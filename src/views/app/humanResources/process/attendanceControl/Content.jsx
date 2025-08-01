import React from 'react'
import { useAttendanceControl } from './useAttendanceControl'
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderControl from './HeaderControl';
import DetailTable from './DetailTable';

const Content = ({ setLoading }) => {

  const {propsToHeader, dataAttendance} = useAttendanceControl({setLoading});

  return (
    <Row>
      <Colxx xxs="12">
        <HeaderControl {...propsToHeader}/>
      </Colxx>
      <Colxx xxs="12">
        <DetailTable dataAttendance={dataAttendance}/>
      </Colxx>
    </Row>
  )
}

export default Content