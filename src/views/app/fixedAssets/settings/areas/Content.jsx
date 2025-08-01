import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import { useAreas } from './useAreas';
import { Detail } from './Detail';

const Content = (props) => {
  const {setLoading} = props;

  const {formState, lists, formValidation, fnChangeCompanyId, onInputChange, onResetForm, fnSaveDocument, isFormValid, table, propsToMsgDelete, sendForm} = useAreas({setLoading});

  const propsToDetail = {
    formState,
    lists,
    formValidation,
    onInputChange,
    fnChangeCompanyId,
    fnClear: onResetForm,
    fnSave: fnSaveDocument,
    isFormValid,
    sendForm
  };
  
  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={5}>
          <Detail {...propsToDetail} />
        </Colxx>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={7}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  );
}
export default Content;