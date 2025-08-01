import React, { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import { formatDate, formatNumber, IntlMessages, validFloat, validInt } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import { useForm } from '@Hooks';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { RadioGroup } from '@Components/radioGroup';
import { request } from '@Helpers/core';
import { SimpleSelect } from '@Components/simpleSelect';
import classnames from 'classnames';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Confirmation from '@Containers/ui/confirmationMsg';
import createNotification from '@Containers/ui/Notifications';
import moment from 'moment';

const ModalDetailPay = ({setOpen, data}) => {
  const {idPayroll, date, biweekId, listEmployees, listBiweeklies, listJobPositions, listPaymentMethod, setLoading, fnViewDetailPayroll, currentItem } = data;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [disabledAbsence, setDisabledAbsence] = useState(false);
  const [disabledIhss, setDisabledIhss] = useState(false);
  const [disabledRap, setDisabledRap] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [sendFormDeduc, setSendFormDeduc] = useState(false);
  const [extDeducDetail, setExtDeducDetail] = useState([]);
  const [dataLoans, setDataLoans] = useState([]);

  const [activeTab, setActiveTab] = useState('1');

  const detailPayValid = {
    employeeId: [(val)=> validInt(val)>0, "msg.required.select.employeeId"],
    methodPaymentId: [(val)=> validInt(val)>0, "msg.required.select.method"],
    daysWorked: [(val)=> validInt(val)>0 && validInt(val)<=15, "msg.required.input.daysWorked"],
    incBiweekly: [(val)=> validInt(val)>0, "msg.required.input.incBiweekly"],
  }

  const deductionValid = {
    value: [(val)=> validInt(val)>0, "msg.required.input.value"],
    description: [(val)=> val!=="", "msg.required.input.description"]
  }

  const {formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm} = useForm({
    id: currentItem.id?currentItem.id:0,
    fatherId: idPayroll,
    employeeId: currentItem.employeeId?currentItem.employeeId:0,
    jobPositionId: currentItem.jobPositionId?currentItem.jobPositionId:0,
    methodPaymentId: currentItem.methodPaymentId?currentItem.methodPaymentId:0,
    daysWorked: currentItem.daysWorked?currentItem.daysWorked:15,
    excusedAbsence: currentItem.excusedAbsence?currentItem.excusedAbsence:0,
    totalIncomes: currentItem.totalIncomes?currentItem.totalIncomes:0,
    internalDeductions: currentItem.internalDeductions?currentItem.internalDeductions:0,
    externalDeductions: currentItem.externalDeductions?currentItem.externalDeductions:0,
    totalDeductions: currentItem.totalDeductions?currentItem.totalDeductions:0,
    totalPayment: currentItem.totalPayment?currentItem.totalPayment:0,
    incBiweekly: currentItem.incBiweekly?currentItem.incBiweekly:0,
    incOvertime: currentItem.incOvertime?currentItem.incOvertime:0,
    incValueHour: currentItem.incValueHour?currentItem.incValueHour:0,
    incOthers: currentItem.incOthers?currentItem.incOthers:0,
    incTotal: currentItem.totalIncomes?currentItem.totalIncomes:0,
    deducIsr: currentItem.deducIsr?currentItem.deducIsr:0,
    deducIhss: currentItem.deducIhss?currentItem.deducIhss:0,
    deducRap: currentItem.deducRap?currentItem.deducRap:0,
    deducAbsence: currentItem.deducAbsence?currentItem.deducAbsence:0,
    deducTotal: currentItem.deducTotal?currentItem.deducTotal:0
  }, detailPayValid);

  const {formState: formStateDeduc, formValidation: formValidationDeduc, isFormValid: isFormValidDeduc, onInputChange:
    onInputChangeDeduc, onResetForm: onResetFormDeduc, setBulkForm: setBulkFormDeduc} = useForm({
    id: 0,
    value: 0,
    description: ''
  }, deductionValid);

  const {id, fatherId, employeeId, jobPositionId, methodPaymentId, daysWorked, excusedAbsence, totalIncomes, internalDeductions,
    externalDeductions, incBiweekly, totalDeductions, totalPayment, incOvertime, incValueHour, incOthers, incTotal, deducIsr,
    deducIhss, deducRap, deducAbsence, deducTotal} = formState;

  const {id: idExtDeducc, value, description} = formStateDeduc;

  const {employeeIdValid, methodPaymentIdValid, daysWorkedValid, incBiweeklyValid} = formValidation;

  const {valueValid, descriptionValid} = formValidationDeduc;

  const onOvertimeChange = e=>{
    const overtime = e.target.value;

    const totalOver = validFloat(overtime) * validFloat(incValueHour);
    const totalInc = totalOver + validFloat(incBiweekly) + validFloat(incOthers);
    const totalPay = validFloat(totalInc) - validFloat(totalDeductions);

    const newValue = {
      incOvertime: overtime,
      incTotal: totalInc,
      totalIncomes: totalInc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onValHourChange = e=>{
    const valHour = e.target.value;

    const totalOver = validFloat(incOvertime) * validFloat(valHour);
    const totalInc = totalOver + validFloat(incBiweekly) + validFloat(incOthers);
    const totalPay = validFloat(totalInc) - validFloat(totalDeductions);

    const newValue = {
      incValueHour: valHour,
      incTotal: totalInc,
      totalIncomes: totalInc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onOthersIncChange = e=>{
    const others = e.target.value;

    const totalOver = validFloat(incOvertime) * validFloat(incValueHour);
    const totalInc = totalOver + validFloat(incBiweekly) + validFloat(others);
    const totalPay = validFloat(totalInc) - validFloat(totalDeductions);

    const newValue = {
      incOthers: others,
      incTotal: totalInc,
      totalIncomes: totalInc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onIsrChange = e=>{
    const totalIsr = e.target.value;

    const totalIntDeduc = validFloat(totalIsr) + validFloat(deducIhss) + validFloat(deducRap) + validFloat(deducAbsence);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducIsr: totalIsr,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onIhssChange = e=>{
    const totalIhss = e.target.value;

    const totalIntDeduc = validFloat(deducIsr) + validFloat(totalIhss) + validFloat(deducRap) + validFloat(deducAbsence);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducIhss: totalIhss,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onRapChange = e=>{
    const totalRap = e.target.value;

    const totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(totalRap) + validFloat(deducAbsence);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducRap: totalRap,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onDaysChange = e=>{
    const totalDays = e.target.value;

    let totalAbsence = 0;
    let totalIntDeduc = 0;

    if(totalDays<15){
      setDisabledAbsence(false);
      totalAbsence = (validFloat(incBiweekly)/15) * (15 - totalDays);
      if(validInt(excusedAbsence) === 1){
        totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
      }else{
        totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + totalAbsence;
      }
    }else{
      totalAbsence = 0;
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
      setDisabledAbsence(true);
    }

    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      daysWorked: totalDays,
      deducAbsence: totalAbsence,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const onAbsenceChange = e=>{
    const absence = e.target.value;

    const totalAbsence = (validFloat(incBiweekly)/15) * (15 - daysWorked);
    let totalIntDeduc = 0;

    if(validInt(absence) === 1){
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
    }else{
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + totalAbsence;
    }

    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      excusedAbsence: absence,
      deducAbsence: totalAbsence,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    setBulkForm(newValue);
  }

  const fnCalDeductions = (dataDeductions, dataLoans)=>{
    let totalAbsence = 0;
    let totalIntDeduc = 0;
    if(daysWorked<15){
      setDisabledAbsence(false);
      totalAbsence = (validFloat(incBiweekly)/15) * (15 - daysWorked);
      if(validInt(excusedAbsence) === 1){
        totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
      }else{
        totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + totalAbsence;
      }
    }else{
      totalAbsence = 0;
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
      setDisabledAbsence(true);
    }

    const valueDeduc = dataDeductions.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    const valueLoans = dataLoans.map(item => validFloat(item.valueQuote)).reduce((prev, curr) => prev + curr, 0);
    const totalExtDeduc = validFloat(valueDeduc) + validFloat(valueLoans);
    const totalDeduc = validFloat(totalExtDeduc) + validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + validFloat(totalAbsence);
    const totalPay = validFloat(incTotal) - totalDeduc;
    setBulkForm({
      externalDeductions: totalExtDeduc,
      deducAbsence: totalAbsence,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    });
  }

  const getDeductions = (loans=dataLoans)=>{
    setExtDeducDetail([]);
    setLoading(true);
    request.GET(`rrhh/process/biweeklyDeductions?biweekId=${biweekId}&employeeId=${employeeId}`, (resp)=>{
      const deductions = resp.data;
      fnCalDeductions(deductions, loans)
      setExtDeducDetail(deductions);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetLoans = ()=>{
    setDataLoans([]);
    const findBiweek = listBiweeklies.find((item)=>{
      return item.value === validInt(biweekId);
    });
    const dateStart = findBiweek.dateIn;
    const dateEnd = findBiweek.dateOut;
    setLoading(true);
    request.GET(`rrhh/process/paymentPlans/getQuoteByDate?dateStart=${dateStart}&dateEnd=${dateEnd}&employeeId=${employeeId}`, (resp)=>{
      const loans = resp.data;
      getDeductions(loans);
      setDataLoans(loans)
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const onEmployeeChange = e=>{
    const employee = e.target.value;

    // Llenar informacion del empleado
    const filterEmployees = listEmployees.filter((item)=>{
      return item.value === employee;
    });

    const detaEmployee = filterEmployees[0];

    if(detaEmployee.deductionsIhss===2){
      setDisabledIhss(true);
    }else{
      setDisabledIhss(false);
    }

    if(detaEmployee.deductionsRap===2){
      setDisabledRap(true);
    }else{
      setDisabledRap(false);
    }

    const findBiweek = listBiweeklies.find((item)=>{
      return item.value === validInt(biweekId);
    });
    const dateStart = findBiweek.dateIn;
    const dateEnd = findBiweek.dateOut;

    // buscar deducciones externas para el empleado seleccionado
    setLoading(true);
    request.GET(`rrhh/process/biweeklyDeductions?biweekId=${biweekId}&employeeId=${employee}`, (resp)=>{
      const deductions = resp.data;

      // buscar prestamos
      setLoading(true);
      request.GET(`rrhh/process/paymentPlans/getQuoteByDate?dateStart=${dateStart}&dateEnd=${dateEnd}&employeeId=${employee}`, (resp)=>{
        const loans = resp.data;

        // buscar permisos
        setLoading(true);
        request.GET(`rrhh/process/permissions/findByDate?dateStart=${dateStart}&dateEnd=${dateEnd}&employeeId=${employee}`, (resp)=>{
          const permissions = resp.data.map(item =>{
            const date1 = moment(item.dateStart);
            const date2 = moment(item.dateEnd);
            const daysDiff = date2.diff(date1, 'days');
            const hoursDiff = date2.diff(date1, 'hours', true);
            return {
              daysDiff,
              hoursDiff
            }
          });

          let daysPerm = permissions.map(item => validFloat(item.daysDiff)).reduce((prev, curr) => prev + curr, 0);
          let hoursPerm = permissions.map(item => validFloat(item.hoursDiff)).reduce((prev, curr) => prev + curr, 0);

          if(daysPerm===0 && hoursPerm>8){
            daysPerm = 1;
            hoursPerm = 0;
          }else if(daysPerm>0){
            daysPerm = daysPerm;
            hoursPerm = 0;
          }

          let totalAbsence = 0;
          let totalIntDeduc = 0;
          let totalDays = 15;
          let excusedAbsence = 0;

          if(daysPerm>0){
            totalDays = totalDays - daysPerm;
            setDisabledAbsence(false);
            totalAbsence = (validFloat(validFloat(detaEmployee.defaultSalary)/2)/15) * daysPerm;
            totalIntDeduc = totalAbsence
            excusedAbsence = 2;
          }else if(hoursPerm>0){
            totalDays = totalDays - (hoursPerm/8);
            setDisabledAbsence(false);
            totalAbsence = ((validFloat(validFloat(detaEmployee.defaultSalary)/2)/15)/8) * hoursPerm;
            totalIntDeduc = totalAbsence
            excusedAbsence = 2;
          }else{
            setDisabledAbsence(true);
            totalAbsence = 0
            totalIntDeduc = 0
            excusedAbsence = 0;
          }

          const totalInc = (validFloat(detaEmployee.defaultSalary)/2) + validFloat(incOthers);
          const valueDeduc = deductions.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
          const valueLoans = loans.map(item => validFloat(item.valueQuote)).reduce((prev, curr) => prev + curr, 0);
          const totalExtDeduc = validFloat(valueDeduc) + validFloat(valueLoans);
          const totalDeduc = validFloat(totalExtDeduc) + validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + validFloat(totalAbsence);
          const totalPay = validFloat(totalInc) - totalDeduc;
          setBulkForm({
            excusedAbsence,
            daysWorked: totalDays,
            deducAbsence: totalAbsence,
            internalDeductions: totalIntDeduc,
            externalDeductions: totalExtDeduc,
            totalDeductions: totalDeduc,
            totalPayment: totalPay,
            employeeId: employee,
            jobPositionId: detaEmployee.jobPositionId,
            methodPaymentId: detaEmployee.paymentMethod,
            incBiweekly: validFloat(detaEmployee.defaultSalary)/2,
            totalIncomes: totalInc,
            incTotal: totalInc
          });

          setLoading(false);
        }, (err)=>{
          console.error(err);
          setLoading(false);
        });

        setDataLoans(loans);
        setLoading(false);
      }, (err)=>{
        console.error(err);
        setLoading(false);
      });

      setExtDeducDetail(deductions);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnAddDeductionExternal = ()=>{
    setSendFormDeduc(true);
    if(!isFormValidDeduc){
      return;
    }

    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newDeduction = {
      id: `T${new Date().getTime()}`,
      date,
      biweekId,
      employeeId,
      value: validFloat(value),
      description
    }

    const totalExtDeduc = validFloat(value) + validFloat(externalDeductions);
    const totalDeduc = validFloat(value) + validFloat(totalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;
    setBulkForm({externalDeductions: totalExtDeduc, totalDeductions: totalDeduc, totalPayment: totalPay});

    if(idExtDeducc===0){
      setLoading(true);
      request.POST('rrhh/process/biweeklyDeductions', newDeduction, (resp) => {
        console.log(resp);
        getDeductions();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

    setExtDeducDetail(current => [...current, newDeduction]);
    setSendFormDeduc(false);
    onResetFormDeduc();
  }

  const fnDeleteDeductionExternal = (item)=>{
    setBulkFormDeduc({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnOkDeleteDeduction = ()=>{
    const newData = extDeducDetail.filter((item)=>{
      return item.id !== idExtDeducc;
    });

    const sumDeduc = newData.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    const totalDeduc = sumDeduc + validFloat(internalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;
    setBulkForm({externalDeductions: sumDeduc, totalDeductions: totalDeduc, totalPayment: totalPay});

    if(idExtDeducc>0){
      setLoading(true);
      request.DELETE(`rrhh/process/biweeklyDeductions/${idExtDeducc}`, (resp) => {
        console.log(resp);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

    setExtDeducDetail(newData);
    setOpenMsgQuestion(false);
  }

  const fnSaveDetailPayroll = ()=>{
    if(fatherId===0){
      return;
    }

    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if(validInt(daysWorked)<15 && excusedAbsence===0){
      createNotification('warning','msg.required.select.excusedAbsence', 'alert.warning.title');
      return;
    }

    const newData = {
      fatherId,
      employeeId,
      jobPositionId,
      methodPaymentId,
      daysWorked,
      excusedAbsence,
      totalIncomes,
      internalDeductions,
      externalDeductions,
      totalDeductions,
      totalPayment,
      incBiweekly,
      incOvertime,
      incValueHour,
      incOthers,
      deducIsr,
      deducIhss,
      deducRap,
      deducTotal
    }

    if(id===0){
      setLoading(true);
      request.POST('rrhh/process/payrollBiweeklyDetail', newData, (resp) => {
        console.log(resp);
        fnViewDetailPayroll(idPayroll);

        // actualizar estado de la cuota del prestamo
        if(dataLoans.length>0){
          let dataUpdate = { status: 1}
          let id = dataLoans[0].id;
          setLoading(true);
          request.PUT(`rrhh/process/paymentPlanDetails/${id}`, dataUpdate, () => {
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
        }

        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/payrollBiweeklyDetail/${id}`, newData, () => {
        fnViewDetailPayroll(idPayroll);
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

  }

  useEffect(()=>{
    if(validInt(daysWorked)<15){
      setDisabledAbsence(false);
    }else{
      setDisabledAbsence(true);
    }
  },[]);

  useEffect(()=>{
    if(id>0){
      fnGetLoans();
    }
  },[]);

  const propsToMsgDeleteDeducction = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteDeduction,
    fnOnNo: onResetFormDeduc,
    title: "alert.question.title"
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Nav tabs className="separator-tabs ml-0 mb-4">
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === '1',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('1')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.generalData")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === '2',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('2')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.incomeExpenses")}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === '3',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('3')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.externalDeduction")}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Colxx xxs="12" sm="4" lg="4" xl="3">
                    <SearchSelect
                      name="biweekId"
                      label='select.biweekId'
                      inputValue={biweekId}
                      options={listBiweeklies}
                      onChange={onInputChange}
                      isDisabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="8" lg="8" xl="6">
                    <SearchSelect
                      label='select.employee'
                      name='employeeId'
                      inputValue={employeeId}
                      options={listEmployees}
                      onChange={onEmployeeChange}
                      invalid={sendForm && !!employeeIdValid}
                      feedbackText={sendForm && (employeeIdValid || null)}
                      isDisabled={currentItem.id?true:false}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="4" lg="4" xl="3">
                    <SearchSelect
                      label='select.jobPosition'
                      name="jobPositionId"
                      inputValue={jobPositionId}
                      options={listJobPositions}
                      onChange={onInputChange}
                      isDisabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="5" lg="5" xl="3">
                    <SimpleSelect
                      name="methodPaymentId"
                      label='select.methodPayment'
                      value={methodPaymentId}
                      onChange={onInputChange}
                      options={listPaymentMethod}
                      invalid={sendForm && !!methodPaymentIdValid}
                      feedbackText={sendForm && (methodPaymentIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="2">
                    <InputField
                      name="daysWorked"
                      label='input.daysWorked'
                      value={daysWorked}
                      onChange={onDaysChange}
                      type="text"
                      invalid={sendForm && !!daysWorkedValid}
                      feedbackText={sendForm && (daysWorkedValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="4" lg="4" xl="3">
                    <RadioGroup
                      label='page.biweeklyPayroll.radio.absence'
                      name='excusedAbsence'
                      value={excusedAbsence}
                      onChange={onAbsenceChange}
                      options={[
                        {id:1, label:'option.yes', disabled:disabledAbsence},
                        {id:2, label:'option.no', disabled:disabledAbsence},
                      ]}
                      display="flex"
                    />
                  </Colxx>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Colxx xxs="12" sm="6">
                    <ContainerWithLabel label="page.biweeklyPayroll.label.income">
                      <Row>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="incBiweekly"
                            label='page.biweeklyPayroll.input.incBiweekly'
                            value={incBiweekly}
                            onChange={onInputChange}
                            type="text"
                            disabled
                            invalid={sendForm && !!incBiweeklyValid}
                            feedbackText={sendForm && (incBiweeklyValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="incOvertime"
                            label='page.biweeklyPayroll.input.incOvertime'
                            value={incOvertime}
                            onChange={onOvertimeChange}
                            type="text"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="incValueHour"
                            label='page.biweeklyPayroll.input.incValueHour'
                            value={incValueHour}
                            onChange={onValHourChange}
                            type="text"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="incOthers"
                            label='page.biweeklyPayroll.input.incOthers'
                            value={incOthers}
                            onChange={onOthersIncChange}
                            type="text"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="incTotal"
                            label='input.total'
                            value={incTotal}
                            onChange={onInputChange}
                            type="text"
                            disabled
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                  <Colxx xxs="12" sm="6">
                    <ContainerWithLabel label="page.biweeklyPayroll.input.internalDeductions">
                      <Row>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="deducIsr"
                            label='page.biweeklyPayroll.input.deducIsr'
                            value={deducIsr}
                            onChange={onIsrChange}
                            type="text"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="deducIhss"
                            label='page.biweeklyPayroll.input.deducIhss'
                            value={deducIhss}
                            onChange={onIhssChange}
                            type="text"
                            disabled={disabledIhss}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="deducRap"
                            label='page.biweeklyPayroll.input.deducRap'
                            value={deducRap}
                            onChange={onRapChange}
                            type="text"
                            disabled={disabledRap}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="deducAbsence"
                            label='page.biweeklyPayroll.input.deducAbsence'
                            value={deducAbsence}
                            onChange={onInputChange}
                            type="text"
                            disabled
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6">
                          <InputField
                            name="deducTotal"
                            label='input.total'
                            value={deducTotal}
                            onChange={onInputChange}
                            type="text"
                            disabled
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Colxx xxs="12" sm="9" lg="6" xl="8">
                    <InputField
                      name="description"
                      label='input.description'
                      value={description}
                      onChange={onInputChangeDeduc}
                      type="text"
                      invalid={sendFormDeduc && !!descriptionValid}
                      feedbackText={sendFormDeduc && (descriptionValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="2">
                    <InputField
                      name="value"
                      label='input.value'
                      value={value}
                      onChange={onInputChangeDeduc}
                      type="text"
                      invalid={sendFormDeduc && !!valueValid}
                      feedbackText={sendFormDeduc && (valueValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="12" lg="3" xl="2" align="right" className="mb-3">
                    <Button color="primary" onClick={fnAddDeductionExternal}>
                      <i className="bi bi-plus" /> {IntlMessages("button.add")}
                    </Button>
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <Table bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th width="70%">{IntlMessages('table.column.description')}</th>
                          <th width="20%">{IntlMessages('table.column.value')}</th>
                          <th width="10%">{IntlMessages('table.column.options')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extDeducDetail.map((item,idx) =>{
                          return (
                            <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                              <td>{item.description}</td>
                              <td>{item.value}</td>
                              <td align='right'>
                                <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                                  onClick={() => {fnDeleteDeductionExternal(item)}} key={`buttons2-${idx}`}>
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
                {
                  dataLoans.length>0?(
                    <>
                    <hr/>
                    <Row>
                      <Colxx xxs="12">
                        <h6>Prestamos</h6>
                        <Table bordered hover size='sm'>
                          <thead>
                            <tr>
                              <th width="10%">{IntlMessages('table.column.no')}</th>
                              <th width="10%">{IntlMessages('table.column.date')}</th>
                              <th width="60%">{IntlMessages('table.column.description')}</th>
                              <th width="20%">{IntlMessages('table.column.value')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataLoans.map((item,idx) =>{
                              return (
                                <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                                  <td>{item.noQuote}</td>
                                  <td>{formatDate(item.date)}</td>
                                  <td>{item.description}</td>
                                  <td>{item.valueQuote}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Colxx>
                    </Row>
                    </>
                  ):null
                }
              </TabPane>
            </TabContent>
          </Colxx>
        </Row>
        <Row className='mt-3'>
          <Colxx xxs="12" sm="7" md="7"> </Colxx>
          <Colxx xxs="12" sm="5" md="5">
            <Table size='sm'>
              <tbody>
                <tr>
                  <td width="25%">{IntlMessages('page.biweeklyPayroll.label.income')}</td>
                  <td align='right' width="15%">{formatNumber(totalIncomes)}</td>
                </tr>
                <tr>
                  <td width="25%">{IntlMessages('page.biweeklyPayroll.input.internalDeductions')}</td>
                  <td align='right' width="15%">{formatNumber(internalDeductions)}</td>
                </tr>
                <tr>
                  <td width="25%">{IntlMessages('page.biweeklyPayroll.input.externalDeductions')}</td>
                  <td align='right' width="15%">{formatNumber(externalDeductions)}</td>
                </tr>
                <tr>
                  <td width="25%">{IntlMessages('page.biweeklyPayroll.input.totalDeductions')}</td>
                  <td align='right' width="15%">{formatNumber(totalDeductions)}</td>
                </tr>
                <tr>
                  <th width="25%">{IntlMessages('table.column.totalPayment')}</th>
                  <td align='right' width="15%"><b>{formatNumber(totalPayment,'L. ',2)}</b></td>
                </tr>
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDetailPayroll}>
          <i className="iconsminds-save" />{` ${IntlMessages("button.save")}`}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgDeleteDeducction}/>
    </>
  )
}

export default ModalDetailPay