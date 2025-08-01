import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DropdownSelect from '@Components/DropdownSelect/DropdownSelect';
// import Confirmation from '@Containers/ui/confirmationMsg';
// import ReactTable from "@Components/reactTable";
// import { useFormat } from './useFormat';
// import { Detail } from './Detail';

const Content = (props) => {
  const { setLoading } = props;

  // const {formState, accountList, formValidation, onInputChange, onResetForm, fnSaveDocument, isFormValid, table, propsToMsgDelete} = useFormat({setLoading});

  // const propsToDetail = {
  //   formState,
  //   accountList,
  //   formValidation,
  //   onInputChange,
  //   fnClear: onResetForm,
  //   fnSave: fnSaveDocument,
  //   isFormValid
  // };

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={5}>
          <DropdownSelect />
          {/* <Detail {...propsToDetail} /> */}
        </Colxx>
        <Colxx xxs={12} xs={12} sm={12} md={6} lg={7}>
          {/* <ReactTable {...table} /> */}
        </Colxx>
      </Row>
      {/* <Confirmation {...propsToMsgDelete} /> */}
    </>
  );
}
export default Content;