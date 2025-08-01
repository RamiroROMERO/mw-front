/* eslint-disable react/prop-types */
import React from 'react'
import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import ModalEditValues from './ModalEditValues';

const DetailTable = ({dateStart, dateEnd, dataDetailPayroll, setLoading, fnViewDetailPayroll}) => {
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [currentItemDeta, setCurrentItemDeta] = useState({});

  const fnEditPayroll = (item)=>{
    setCurrentItemDeta(item);
    setOpenModalDetail(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.jobPosition"),
        dataField: "jobPosition",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalIncomes"),
        dataField: "totalIncomesValue",
        headerStyle: {width: "20%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalPayment"),
        dataField: "totalPaymentValue",
        headerStyle: {width: "20%"},
        style:{textAlign: 'right'}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditPayroll,
      }
    ]
  });

  useEffect(()=>{
    setTable({...table, data: dataDetailPayroll});
  },[dataDetailPayroll]);

  const propsToModalEditValues = {
    ModalContent: ModalEditValues,
    title: "page.resumePayroll.modal.viewDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      dateStart,
      dateEnd,
      currentItemDeta,
      setLoading,
      fnViewDetailPayroll
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Modal {...propsToModalEditValues}/>
    </>
  )
}

export default DetailTable