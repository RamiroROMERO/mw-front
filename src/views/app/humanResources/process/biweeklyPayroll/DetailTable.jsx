import React, { useState, useEffect } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import ModalDetailPay from './ModalDetailPay';

const DetailTable = ({idPayroll, date, biweekId, dataDetailPayroll, listEmployees, listBiweeklies, listJobPositions, listPaymentMethod, setLoading, fnViewDetailPayroll, setOpenModalPrint, setEmployeeId}) => {
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [currentItem, setCurrentItem] = useState({});

  const fnAddNewEmployee = ()=>{
    if(idPayroll>0){
      setCurrentItem({});
      setOpenModalDetail(true);
    }
  }

  const fnEditPayroll = (item)=>{
    setCurrentItem(item);
    setOpenModalDetail(true);
  }

  const fnPrintPayReceipt = (item)=>{
    setEmployeeId(item.employeeId);
    setOpenModalPrint(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.jobPosition"),
        dataField: "jobPosition",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalIncome"),
        dataField: "totalIncomesVal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalDeductions"),
        dataField: "totalDeductionsVal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalPayment"),
        dataField: "totalPaymentVal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      }
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: true,
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: "Editar",
        onClick: fnEditPayroll,
      },
      {
        color: "secondary",
        icon: "printer",
        toolTip: "Imprimir",
        onClick: fnPrintPayReceipt,
      }
    ]
  });

  useEffect(()=>{
    const newActions = {
      color: "primary",
      icon: "plus",
      onClick: fnAddNewEmployee,
      title: "Agregar",
      isFreeAction: true
    }
    const {actions} = table;
    const dataTable = {...table, data: dataDetailPayroll, actions: [actions, newActions]};
    setTable(dataTable);
  },[idPayroll, dataDetailPayroll]);

  const propsToModalDetail = {
    ModalContent: ModalDetailPay,
    title: "page.biweeklyPayroll.modal.viewDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      idPayroll,
      date,
      biweekId,
      listEmployees,
      listBiweeklies,
      listJobPositions,
      listPaymentMethod,
      setLoading,
      fnViewDetailPayroll,
      currentItem
    }
  }

  return (
    <>
    <Row>
      <Colxx xxs="12">
        <ReactTable {...table}/>
      </Colxx>
    </Row>
    <Modal {...propsToModalDetail} />
    </>
  )
}

export default DetailTable