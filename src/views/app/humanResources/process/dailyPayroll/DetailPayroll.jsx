import React, { useState, useEffect } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Row } from 'reactstrap';
import { IntlMessages, formatDate } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import ModalManualPayroll from './ModalManualPayroll';

const DetailPayroll = ({idPayroll, date, customerId, projectId, responsibleId, scheduleId, listCustomers, listProjects, listManagers, listSchedules, listEmployees, listDaysTypes, filterProjects, setFilterProjects, onInputChange, setBulkForm, setLoading, onResetForm, dataPayrolls, payrollDetail, setPayrollDetail, fnGetPayrollDetail, fnGetPayrolls}) => {
  const [openPayrollDetail, setOpenPayrollDetail] = useState(false);

  const fnEditPayroll = (item)=>{
    fnGetPayrollDetail(item.id);
    setBulkForm(item);
    setOpenPayrollDetail(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.dailyPayroll.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customer",
        headerStyle: {width: "24%"}
      },
      {
        text: IntlMessages("page.dailyPayroll.table.project"),
        dataField: "project",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.employees.select.workSchedule"),
        dataField: "turnName",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.dailyPayroll.modal.manualPayroll.table.regularHours"),
        dataField: "regularValue",
        headerStyle: {width: "12%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.dailyPayroll.modal.manualPayroll.table.overtimeHours"),
        dataField: "overtimeValue",
        headerStyle: {width: "12%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: {width: "12%"},
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

  const propsToModalPayrollDetail = {
    ModalContent: ModalManualPayroll,
    title: "page.dailyPayroll.modal.editPayroll.title",
    open: openPayrollDetail,
    setOpen: setOpenPayrollDetail,
    maxWidth: 'lg',
    data: {
      idPayroll,
      date,
      customerId,
      projectId,
      responsibleId,
      scheduleId,
      listCustomers,
      listProjects,
      listManagers,
      listSchedules,
      listEmployees,
      listDaysTypes,
      filterProjects,
      setFilterProjects,
      onInputChange,
      setBulkForm,
      setLoading,
      onResetForm,
      payrollDetail,
      setPayrollDetail,
      fnGetPayrolls
    }
  }

  useEffect(()=>{
    const dataTable = {...table, data: dataPayrolls};
    setTable(dataTable);
  },[dataPayrolls]);

  return (
    <>
    <Row>
      <Colxx xxs="12">
        <ReactTable {...table}/>
      </Colxx>
    </Row>
    <Modal {...propsToModalPayrollDetail}/>
    </>
  )
}

export default DetailPayroll