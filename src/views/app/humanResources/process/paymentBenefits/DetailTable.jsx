import React, { useState, useEffect } from 'react'
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Row } from 'reactstrap';
import ReactTable from '@Components/reactTable'
import { request } from '@/helpers/core';
import Confirmation from '@/containers/ui/confirmationMsg';

const DetailTable = ({id, dataPayDetail, setLoading, fnViewPaymentDetail}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [idQuote, setIdQuote] = useState(0);

  const fnEditDocument = (item) => {
    setIdQuote(item.id);
    setOpenMsgQuestion(true);
  }

  const fnCkeckQuote = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const editData = {
      status: 1
    }
    request.PUT(`rrhh/process/benefitsPaymentPlanDetails/${idQuote}`, editData, () => {
      fnViewPaymentDetail(id);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.paymentPlans.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.quota"),
        dataField: "noQuote",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "35%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "30%"},
        style:{textAlign: 'right'},
        cell:({row})=>{
          return (formatNumber(row.original.value,'', 2));
        }
      },
      {
        text: IntlMessages("table.column.paid"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [{
      color: 'info',
      onClick: fnEditDocument,
      icon: 'check-lg'
    }]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataPayDetail};
    setTable(dataTable);
  },[dataPayDetail]);

  const propsToMsgUpdateQuote = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnCkeckQuote,
    title: "msg.question.quotePaid.title"
  }

  return (
    <>
    <Row>
      <Colxx xxs="12">
        <ReactTable {...table}/>
      </Colxx>
    </Row>
    <Confirmation {...propsToMsgUpdateQuote} />
    </>
  )
}

export default DetailTable