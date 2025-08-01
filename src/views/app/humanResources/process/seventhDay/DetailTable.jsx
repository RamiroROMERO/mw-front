import React, { useState, useEffect } from 'react'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { request } from '@Helpers/core';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import ModalDetailSeventh from './ModalDetailSeventh'

const DetailTable = ({dataSeventhDay, listEmployees, setLoading}) => {
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [dataDetailSeventh, setDataDetailSeventh] = useState([]);
  const [idFather, setIdFather] = useState(0);
  const [date, setDate] = useState("");

  const fnGetDetail = (fatherId)=>{
    setLoading(true);
    request.GET(`rrhh/process/payrollSevenDayDetails?fatherId=${fatherId}`, (resp)=>{
      const payrollDetail = resp.data.map((item)=>{
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataDetailSeventh(payrollDetail);
      setOpenModalDetail(true);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewDetail = (itemDeta) =>{
    setDate(itemDeta.date);
    setIdFather(itemDeta.id);
    fnGetDetail(itemDeta.id);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.seventhDay.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "startDate",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.dateEnd"),
        dataField: "endDate",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: {width: "30%"},
        style:{textAlign: 'right'},
        formatter:(cell, row)=>{
          return (formatNumber(cell,'', 2));
        }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewDetail
      }
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataSeventhDay};
    setTable(dataTable);
  },[dataSeventhDay]);

  const propsToModalDetailSeventh = {
    ModalContent: ModalDetailSeventh,
    title: "page.seventhDay.modal.viewDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'md',
    data: {
      date,
      idFather,
      dataDetailSeventh,
      listEmployees,
      setLoading,
      fnGetDetail
    }
  }

  return (
    <>
      <ReactTable {...table}/>
      <Modal {...propsToModalDetailSeventh}/>
    </>
  )
}

export default DetailTable