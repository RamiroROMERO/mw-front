import React, { useState } from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DetailInput from './DetailInput';
import DetailTable from './DetailTable';
import { useInputOutputs } from './useInputOutputs';

const InpuOutputs = (props) => {
  const { setLoading, adminControl } = props;

  const {propsToDetailInput, propsToDetailTable} = useInputOutputs({setLoading, adminControl});

  return (
    <>
      <Row>
        <Colxx xss="12" lg="12">
          <DetailInput {...propsToDetailInput} />
        </Colxx>
        <Colxx xss="12" lg="12">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default InpuOutputs;