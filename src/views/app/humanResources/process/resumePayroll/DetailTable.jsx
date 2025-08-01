/* eslint-disable react/prop-types */
import {useEffect, useState} from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import ModalViewDetailPay from './ModalViewDetailPay';

const DetailTable = ({idPayroll, typePayroll, dateStart, dateEnd, notes, dataDetailPayroll, listTypeDeductions, listEmployees, listJobPositions, listPaymentMethod, listSchedules, listTypeIncomes, setEmployeeId, setOpenModalPrint, setLoading, fnViewDetailPayroll}) => {
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [currentItemDeta, setCurrentItemDeta] = useState({});

  const fnAddNewEmployee = ()=>{
    if(idPayroll>0){
      setCurrentItemDeta({});
      setOpenModalDetail(true);
    }
  }

  const fnEditPayroll = (item)=>{
    setCurrentItemDeta(item);
    setOpenModalDetail(true);
  }

  const fnPrintPayReceipt = (item)=>{
    setEmployeeId(item.employeeId);
    setOpenModalPrint(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.table.title"),
    columns: typePayroll===1?[
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.jobPosition"),
        dataField: "jobPosition",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("page.employees.select.workSchedule"),
        dataField: "turnName",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalIncome"),
        dataField: "totalIncomesValue",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalDeductions"),
        dataField: "totalDeductionsValue",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalPayment"),
        dataField: "totalPaymentValue",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      }
    ]:[
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
        text: IntlMessages("page.employees.select.workSchedule"),
        dataField: "turnName",
        headerStyle: {width: "25%"}
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
    setTable({...table, data: dataDetailPayroll, actions: typePayroll===1?[actions, newActions]:[actions]});
  },[dataDetailPayroll]);

  const propsToModalDetailPay = {
    ModalContent: ModalViewDetailPay,
    title: "page.resumePayroll.modal.viewDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      idPayroll,
      typePayroll,
      dateStart,
      dateEnd,
      notes,
      listTypeDeductions,
      listEmployees,
      listJobPositions,
      listPaymentMethod,
      listSchedules,
      listTypeIncomes,
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
    <Modal {...propsToModalDetailPay}/>
    </>
  )
}

export default DetailTable