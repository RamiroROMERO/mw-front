import React, { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { IntlMessages, formatNumber, validInt } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import createNotification from '@Containers/ui/Notifications'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalPayDetail from './ModalPayDetail'

const ModalManualPayroll = ({data, setOpen}) => {
  const {idPayroll, date, customerId, projectId, responsibleId, scheduleId, listCustomers, listProjects, listManagers,
    listSchedules, listEmployees, listDaysTypes, filterProjects, setFilterProjects, onInputChange, setBulkForm, setLoading, payrollDetail, setPayrollDetail, fnGetPayrolls} = data;
  
  const [openPayDetail, setOpenPayDetail] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const {formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta}=
  useForm({
    id: 0,
    employeeId: 0,
    regularHours: 0,
    regularHourValue: 0,
    regularValue: 0,
    overtimeHours: 0,
    overtimeHourValue: 0,
    overtimeValue: 0,
    total: 0,
    entryTime: '',
    departureTime: '',
    dayTypeId: 0,
    isHoliday: 0
  });

  const {id: idPayrollDeta, employeeId, regularHours, regularHourValue, regularValue, overtimeHours, overtimeHourValue, overtimeValue, total, entryTime, departureTime, dayTypeId, isHoliday} = formStateDeta;

  const onCustomerChange = e =>{
    const custId = validInt(e.target.value);

    const filter = listProjects.filter((item)=>{
      return item.customerId === custId
    });

    setFilterProjects(filter);

    setBulkForm({customerId: custId, projectId:0});
  }

  const fnSavePayroll = ()=>{
    if(date===""){
      createNotification('warning','msg.required.input.date', 'alert.warning.title');
      return
    }
    if(customerId===0){
      createNotification('warning','msg.required.select.customer', 'alert.warning.title');
      return
    }
    if(projectId===0){
      createNotification('warning','msg.required.select.project', 'alert.warning.title');
      return
    }
    if(responsibleId===0){
      createNotification('warning','msg.required.select.manager', 'alert.warning.title');
      return
    }
    if(scheduleId===0){
      createNotification('warning','msg.required.select.scheduleId', 'alert.warning.title');
      return
    }
    if(payrollDetail.length===0){
      createNotification('warning','msg.required.select.employees', 'alert.warning.title');
      return
    }

    const newData = {
      date,
      customerId,
      projectId,
      responsibleId,
      scheduleId
    }

    payrollDetail.map((item) => {
      delete item.id;
      return item;
    });

    if(idPayroll === 0){
      setLoading(true);
      request.POST('rrhh/process/dailyPayrolls', newData, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});
        setOpen(false);
        // guardar empleados
        payrollDetail.forEach(item => {
          const employeesDeta ={
            fatherId: resp.data.id,
            ...item
          }
          setLoading(true);
          request.POST('rrhh/process/dailyPayrollDetails', employeesDeta, () =>{
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          },false);
        });
        fnGetPayrolls();
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/dailyPayrolls/${idPayroll}`, newData, () => {
        setOpen(false);
        // Eliminar empleados
        request.DELETE(`rrhh/process/dailyPayrollDetails?fatherId=${idPayroll}`, () => {
          // guardar empleados
          payrollDetail.forEach(item => {
            const employeesDeta ={
              fatherId: idPayroll,
              ...item
            }
            setLoading(true);
            request.POST('rrhh/process/dailyPayrollDetails', employeesDeta, () =>{
              setLoading(false);
            }, (err) => {
              console.error(err);
              setLoading(false);
            },false);
          });
          fnGetPayrolls();
        }, (err) => {
          console.error(err);
          setLoading(false);
        },false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnAddEmployees = ()=>{
    onResetFormDeta();
    setOpenPayDetail(true);
  }

  const fnDeleteEmployee = (itemEmpl)=>{
    setBulkFormDeta({id:itemEmpl.id});
    setOpenMsgQuestion(true);
  }

  const fnOkDeleteEmployee = ()=>{
    const newData = payrollDetail.filter((item)=>{
      return item.id !== idPayrollDeta;
    });
    setPayrollDetail(newData);
    setOpenMsgQuestion(false);
  }

  const fnEditEmployee = (itemEmpl)=>{
    setBulkFormDeta(itemEmpl);
    setOpenPayDetail(true);
  }

  const propsToModalPayDetail = {
    ModalContent: ModalPayDetail,
    title: "page.dailyPayroll.modal.payDetail.title",
    open: openPayDetail,
    setOpen: setOpenPayDetail,
    maxWidth: 'sm',
    data: {
      idPayrollDeta,
      employeeId,
      date,
      regularHours,
      regularHourValue,
      regularValue,
      overtimeHours,
      overtimeHourValue,
      overtimeValue,
      total,
      entryTime,
      dayTypeId,
      isHoliday,
      departureTime,
      listEmployees,
      listDaysTypes,
      payrollDetail,
      setPayrollDetail,
      onInputChangeDeta,
      setBulkFormDeta,
      onResetFormDeta
    }
  }

  useEffect(()=>{
    if(customerId>0){
      const filter = listProjects.filter((item2)=>{
        return item2.customerId === customerId
      });

      setFilterProjects(filter);
    }
  },[]);

  const propsToMsgDeleteEmployee = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteEmployee,
    fnOnNo: onResetFormDeta,
    title: "alert.question.title"
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" sm="6" lg="3">
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="5">
          <SearchSelect
            label='select.customer'
            name='customerId'
            inputValue={customerId}
            options={listCustomers}
            onChange={onCustomerChange}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="4">
          <SearchSelect
            label='page.dailyReport.select.projectId'
            name='projectId'
            inputValue={projectId}
            options={filterProjects}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" md="6">
          <SearchSelect
            label='page.dailyReport.select.managerId'
            name='responsibleId'
            inputValue={responsibleId}
            options={listManagers}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" md="6">
          <SearchSelect
            label='page.employees.select.workSchedule'
            name="scheduleId"
            inputValue={scheduleId}
            options={listSchedules}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" align="right" className="mb-3">
          <Button color="primary" onClick={fnAddEmployees}>
            <i className="bi bi-plus" /> {IntlMessages("button.addEmployees")}
          </Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Table bordered hover size='sm'>
            <thead>
              <tr>
                <th width="30%">{IntlMessages('table.column.employee')}</th>
                <th width="12%">{IntlMessages('page.dailyPayroll.modal.manualPayroll.table.regularHours')}</th>
                <th width="12%">{IntlMessages('page.dailyPayroll.modal.manualPayroll.table.valueHour')}</th>
                <th width="12%">{IntlMessages('page.dailyPayroll.modal.manualPayroll.table.overtimeHours')}</th>
                <th width="12%">{IntlMessages('page.dailyPayroll.modal.manualPayroll.table.valueOvertime')}</th>
                <th width="12%">{IntlMessages('table.column.total')}</th>
                <th width="10%">{IntlMessages('table.column.options')}</th>
              </tr>
            </thead>
            <tbody>
              {payrollDetail.map((item,idx) =>{
                return (
                  <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                    <td>{item.name}</td>
                    <td>{item.regularHours}</td>
                    <td>{item.regularHourValue}</td>
                    <td>{item.overtimeHours}</td>
                    <td>{item.overtimeHourValue}</td>
                    <td>{formatNumber(item.total, 'L.',2)}</td>
                    <td align='right'>
                      <Button type="button" className="btn-circle-table" color="warning" title="Editar"
                        onClick={() => {fnEditEmployee(item)}} key={`buttons-${idx}`}>
                        <i className='bi bi-pencil' />
                      </Button>
                      <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                        onClick={() => {fnDeleteEmployee(item)}} key={`buttons2-${idx}`}>
                        <i className='bi bi-trash' />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnSavePayroll}>
        <i className="iconsminds-save" />{` ${IntlMessages("button.save")}`}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    <Modal {...propsToModalPayDetail}/>
    <Confirmation {...propsToMsgDeleteEmployee}/>
    </>
  )
}

export default ModalManualPayroll