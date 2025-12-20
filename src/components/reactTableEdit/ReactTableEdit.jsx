import React from 'react'

import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { CardTitle, Row, Table } from 'reactstrap';
import { BodyTable } from './BodyTable';
import { HeaderTable } from './HeaderTable';
import { useReactTableEdit } from './useReactTableEdit';

export const ReactTableEdit = ({title, columns, data, onChangeData=undefined, options, showHeader=true}) => {
  
  const {valueSearch, onSearchData, dataSearch, handleChange, nameColumns, editableColumns, styleColumns,tableHeight } = useReactTableEdit({columns, data, onChangeData, options});

  const tableStyle = {
    height: tableHeight||'250px',
    borderBottom :'1px solid #dee2e6'
  }

  return (

    <>
    <Row style={{display: showHeader===true? 'flex': 'none'}}>
      <Colxx xxs={12} sm={6} md={7} lg={8}>
        <CardTitle>{title}</CardTitle>
      </Colxx>
      <Colxx xxs={12} sm={6} md={5} lg={4}>
        <InputField
          label='dataTable-search'
          value={valueSearch}
          name='valueSearch'
          onChange={onSearchData}
        />
      </Colxx>
    </Row>
    <Table 
      bordered
      size="sm"
      style={{marginBottom:'0px', tableLayout: 'fixed'}}
      >
      <HeaderTable
        columns={columns}
      />
    </Table>
    <div 
      style={{...tableStyle}}
      >
      <PerfectScrollbar
        options={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <Table 
          bordered
          hover
          size='sm'
          style={{marginBottom:'0px', tableLayout: 'fixed'}}
        >
          <BodyTable
            data={dataSearch}
            nameColumns={nameColumns}
            editableColumns={editableColumns}
            styleColumns={styleColumns}
            handleChange={handleChange}
            multiSelected
            onMultiSelected
            />
        </Table>
      </PerfectScrollbar>
    </div>
    </>
  );

}
