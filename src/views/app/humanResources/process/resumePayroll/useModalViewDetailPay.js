import { useEffect, useState } from 'react'
import { fnCalcDaysVacations, getDaysDiffExcMonday, validFloat, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import moment from 'moment';

export const useModalViewDetailPay = ({idPayroll, typePayroll, dateStart, dateEnd, notes, currentItemDeta, setLoading, listEmployees, listTypeDeductions, listTypeIncomes, fnViewDetailPayroll, setOpen }) => {
  const [activeTab, setActiveTab] = useState('1');
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [percent, setPercent] = useState(0);
  const [extDeducDetail, setExtDeducDetail] = useState([]);
  const [incomesDetail, setIncomesDetail] = useState([]);
  const [dataLoans, setDataLoans] = useState([]);
  const [dataAttendance, setDataAttendance] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteIncomes, setOpenMsgDeleteIncomes] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [sendFormDeduc, setSendFormDeduc] = useState(false);
  const [sendFormIncomes, setSendFormIncomes] = useState(false);
  // const [disabledAbsence, setDisabledAbsence] = useState(false);
  const [disabledIhss, setDisabledIhss] = useState(false);
  const [disabledRap, setDisabledRap] = useState(false);

  const detailPayValid = {
    employeeId: [(val)=> validInt(val)>0, "msg.required.select.employeeId"],
    methodPaymentId: [(val)=> validInt(val)>0, "msg.required.select.method"],
    daysWorked: [(val)=> validInt(val)>0, "msg.required.input.daysWorked"]
  }

  const deductionValid = {
    typeId: [(val) => validFloat(val) > 0, "msg.required.input.type"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    description: [(val) => val !== "", "msg.required.input.description"]
  }

  const incomesValid = {
    typeIdInc: [(val) => validFloat(val) > 0, "msg.required.input.type"],
    valueInc: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    descriptionInc: [(val) => val !== "", "msg.required.input.description"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onBulkForm } = useForm({
    id: currentItemDeta?.id || 0,
    fatherId: idPayroll,
    employeeId: currentItemDeta?.employeeId || 0,
    jobPositionId: currentItemDeta?.jobPositionId || 0,
    methodPaymentId: currentItemDeta?.methodPaymentId || 0,
    daysWorked: currentItemDeta?.daysWorked || 0,
    daysVacationTaken: currentItemDeta?.daysVacationTaken || 0,
    hoursWorked: currentItemDeta?.hoursWorked || 0,
    excusedAbsence: currentItemDeta?.excusedAbsence || 0,
    turnId: currentItemDeta?.turnId || 0,
    regularHours: currentItemDeta?.regularHours || 0,
    overtimeHours: currentItemDeta?.overtimeHours || 0,
    totalIncomes: currentItemDeta?.totalIncomes || 0,
    internalDeductions: currentItemDeta?.internalDeductions || 0,
    externalDeductions: currentItemDeta?.externalDeductions || 0,
    totalDeductions: currentItemDeta?.totalDeductions || 0,
    totalPayment: currentItemDeta?.totalPayment || 0,
    incWeekly: currentItemDeta?.incWeekly || 0,
    incOvertime: currentItemDeta?.incOvertime || 0,
    incValueHour: currentItemDeta?.incValueHour || 0,
    incValueHourOver: currentItemDeta?.incValueHourOver || 0,
    incOthers: currentItemDeta?.incOthers || 0,
    incSevenDay: currentItemDeta?.incSevenDay || 0,
    incTotal: currentItemDeta?.totalIncomes || 0,
    deducIsr: currentItemDeta?.deducIsr || 0,
    deducIhss: currentItemDeta.deducIhss || 0,
    deducRap: currentItemDeta.deducRap || 0,
    deducAbsence: currentItemDeta.deducAbsence || 0,
    deducTotal: currentItemDeta.deducTotal || 0
  }, detailPayValid);

  const { formState: formStateDeduc, formValidation: formValidationDeduc, isFormValid: isFormValidDeduc, onInputChange:
    onInputChangeDeduc, onResetForm: onResetFormDeduc, onBulkForm: onBulkFormDeduc } = useForm({
      id: 0,
      typeId: 0,
      noAccount: '',
      value: 0,
      description: ''
    }, deductionValid);

  const { formState: formStateIncomes, formValidation: formValidationIncomes, isFormValid: isFormValidIncomes, onInputChange:
    onInputChangeIncomes, onResetForm: onResetFormIncomes, onBulkForm: onBulkFormIncomes } = useForm({
      idInc: 0,
      typeIdInc: 0,
      noAccountInc: '',
      daysInc: 0,
      hoursInc: 0,
      valueInc: 0,
      descriptionInc: ''
    }, incomesValid);

  const { id, fatherId, employeeId, jobPositionId, methodPaymentId, daysWorked, daysVacationTaken, excusedAbsence, turnId, totalIncomes, internalDeductions, externalDeductions, totalDeductions, incWeekly, incValueHour, incOvertime, incSevenDay, incOthers, deducIsr, deducIhss, deducRap, deducAbsence, deducTotal, totalPayment } = formState;

  const { id: idExtDeducc, typeId, value, description } = formStateDeduc;

  const { idInc, typeIdInc, daysInc, hoursInc, valueInc, descriptionInc} = formStateIncomes;

  const onEmployeeChange = e=>{
    const employeeId = e.target.value;

    // Llenar informacion del empleado
    const filterEmployees = listEmployees.filter((item)=>{
      return item.value === employeeId;
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

    // buscar ingresos y deducciones externas para el empleado seleccionado
    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrolls/getIncomesDeductions?dateStart=${dateStart}&dateEnd=${dateEnd}&employeeId=${employeeId}`, (resp) => {
      const detail = resp.data[0];

      onBulkForm({
        excusedAbsence: detail.excusedAbsence,
        daysWorked: detail.daysWorked,
        daysVacationTaken: detail.daysVacationTaken,
        deducAbsence: detail.deducAbsence,
        internalDeductions: detail.internalDeductions,
        externalDeductions: detail.externalDeductions,
        totalDeductions: detail.totalDeductions,
        deducTotal: detail.totalDeductions,
        totalPayment: detail.totalPayment,
        employeeId: employeeId,
        jobPositionId: detail.jobPositionId,
        methodPaymentId: detail.paymentMethod,
        turnId: detail.turnId,
        incWeekly: detail.incWeekly,
        totalIncomes: detail.totalIncomes,
        incTotal: detail.totalIncomes
      });

      const dataDeductions = [];
      if(detail.loansDeta){
        detail.loansDeta.map((item)=>{
          const dataLoans = {
            id: item.id,
            fatherId: id,
            typeId: item.typeId,
            noAccount: item.noAccount,
            value: item.value,
            description: item.description
          }
          dataDeductions.push(dataLoans);
        });

        setDataLoans(detail.loansDeta);
      }

      if(detail.deductionsDeta){
        detail.deductionsDeta.map((item)=>{
          const dataDeduc = {
            id: item.id,
            fatherId: id,
            typeId: item.typeId,
            noAccount: item.rrhhDeductionType.noAccount,
            value: item.value,
            description: item.description
          }
          dataDeductions.push(dataDeduc);
        });
      }

      setExtDeducDetail(dataDeductions);
      setIncomesDetail(detail.incomesDeta);

      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const onDaysChange = e=>{
    const totalDays = e.target.value;

    let totalAbsence = 0;
    let totalIntDeduc = 0;

    if(totalDays<15){
      totalAbsence = (validFloat(incWeekly)/15) * (15 - totalDays);
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap) + totalAbsence;
    }else{
      totalAbsence = 0;
      totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(deducRap);
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

    onBulkForm(newValue);
  }

  const onAbsenceChange = e=>{
    const absence = e.target.value;

    const totalAbsence = (validFloat(incWeekly)/15) * (15 - daysWorked);
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

    onBulkForm(newValue);
  }

  const onPercentChange = e =>{
    const percentVal = e.target.value;

    const payByHour = validFloat(incWeekly) / 15 / 8;
    const valHours = validFloat(payByHour, 4) * hoursInc;
    const valHoursOver = (validFloat(percentVal) / 100) * valHours;
    const totalPay = valHoursOver>0? valHours + valHoursOver : 0;

    const newValue = {
      valueInc: validFloat(totalPay,2),
      daysInc: 0
    }

    onBulkFormIncomes(newValue);
    setPercent(percentVal);
  }

  const onHoursChange = e =>{
    const hoursValue = e.target.value;

    const payByHour = validFloat(incWeekly) / 15 / 8;
    const valHours = validFloat(payByHour, 4) * hoursValue;
    const valHoursOver = (validFloat(percent) / 100) * valHours;
    const totalPay = valHoursOver>0? valHours + valHoursOver : 0;

    const newValue = {
      hoursInc: hoursValue,
      valueInc: validFloat(totalPay,2),
      daysInc: 0
    }

    onBulkFormIncomes(newValue);
  }

  const onDaysIncChange = e =>{
    const daysValue = e.target.value;

    const valDay = validFloat(incWeekly)/15;
    const totalPay = valDay * validFloat(daysValue);

    const newValue = {
      daysInc: daysValue,
      valueInc: validFloat(totalPay,2),
      hoursInc: 0
    }

    onBulkFormIncomes(newValue);
  }

  const onOthersIncChange = e => {
    const others = e.target.value;

    const totalInc = validFloat(incOvertime) + validFloat(incWeekly) + validFloat(incSevenDay) + validFloat(others);
    const totalPay = validFloat(totalInc) - validFloat(totalDeductions);

    const newValue = {
      incOthers: others,
      incTotal: totalInc,
      totalIncomes: totalInc,
      totalPayment: totalPay
    }

    onBulkForm(newValue);
  }

  const onSevenIncChange = e => {
    const seven = e.target.value;

    const totalInc = validFloat(incOvertime) + validFloat(incWeekly) + validFloat(incOthers) + validFloat(seven);
    const totalPay = validFloat(totalInc) - validFloat(totalDeductions);

    const newValue = {
      incSevenDay: seven,
      incTotal: totalInc,
      totalIncomes: totalInc,
      totalPayment: totalPay
    }

    onBulkForm(newValue);
  }

  const onIsrChange = e => {
    const totalIsr = e.target.value;

    const totalIntDeduc = validFloat(totalIsr) + validFloat(deducIhss) + validFloat(deducRap);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducIsr: totalIsr,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    onBulkForm(newValue);
  }

  const onIhssChange = e => {
    const totalIhss = e.target.value;

    const totalIntDeduc = validFloat(deducIsr) + validFloat(totalIhss) + validFloat(deducRap);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducIhss: totalIhss,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    onBulkForm(newValue);
  }

  const onRapChange = e => {
    const totalRap = e.target.value;

    const totalIntDeduc = validFloat(deducIsr) + validFloat(deducIhss) + validFloat(totalRap);
    const totalDeduc = totalIntDeduc + validFloat(externalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;

    const newValue = {
      deducRap: totalRap,
      deducTotal: totalIntDeduc,
      internalDeductions: totalIntDeduc,
      totalDeductions: totalDeduc,
      totalPayment: totalPay
    }

    onBulkForm(newValue);
  }

  const fnGetDeductions = () => {
    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrollDeductions?fatherId=${id}`, (resp) => {
      const deductions = resp.data;
      setExtDeducDetail(deductions);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetIncomes = ()=>{
    setLoading(true);
    request.GET(`rrhh/process/weeklyPayrollIncomes?fatherId=${id}`, (resp) => {
      const incomes = resp.data;
      setIncomesDetail(incomes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetAttendance = ()=>{
    setLoading(true);
    request.GET(`rrhh/proccess/attendanceControl/findDetail?employeeId=${employeeId}&dateStart=${dateStart}&dateEnd=${dateEnd}&turnId=${turnId}`, (resp) => {
      setDataAttendance(resp.data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  // agregar deducciones internas
  const fnAddDeductionExternal = () => {
    setSendFormDeduc(true);
    if (!isFormValidDeduc) {
      return;
    }

    const filterTypes = listTypeDeductions.find(item => item.value === typeId);

    const newDeduction = {
      fatherId: id,
      typeId,
      noAccount: filterTypes?.noAccount || '',
      value: validFloat(value),
      description
    }

    let allDeductions = [];
    if(idExtDeducc > 0){
      allDeductions = extDeducDetail.filter(item => item.id !== idExtDeducc);
    }else{
      allDeductions = extDeducDetail;
    }

    const totalExtDeduc = allDeductions.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0) + validFloat(value);
    const totalDeduc = totalExtDeduc;
    const totalPay = validFloat(totalIncomes) - totalDeduc;
    onBulkForm({ externalDeductions: totalExtDeduc, totalDeductions: totalDeduc, totalPayment: totalPay });

    if (idExtDeducc === 0) {
      setLoading(true);
      request.POST('rrhh/process/weeklyPayrollDeductions', newDeduction, (resp) => {
        setSendFormDeduc(false);
        onResetFormDeduc();
        fnGetDeductions();

        // actualizar totales
        const newTotals = {
          externalDeductions: totalExtDeduc,
          totalDeductions: totalDeduc,
          totalPayment: totalPay
        }

        setLoading(true);
        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/weeklyPayrollDeductions/${idExtDeducc}`, newDeduction, (resp) => {
        setSendFormDeduc(false);
        onResetFormDeduc();
        fnGetDeductions();

        // actualizar totales
        const newTotals = {
          externalDeductions: totalExtDeduc,
          totalDeductions: totalDeduc,
          totalPayment: totalPay
        }

        setLoading(true);
        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  // editar decucciones externas
  const fnEditDeductionExternal = (item) => {
    onBulkFormDeduc(item);
  }

  const fnDeleteDeductionExternal = (item) => {
    onBulkFormDeduc({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnOkDeleteDeduction = () => {
    const newData = extDeducDetail.filter((item) => {
      return item.id !== idExtDeducc;
    });

    const sumDeduc = newData.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    const totalDeduc = sumDeduc + validFloat(internalDeductions);
    const totalPay = validFloat(totalIncomes) - totalDeduc;
    onBulkForm({ externalDeductions: sumDeduc, totalDeductions: totalDeduc, totalPayment: totalPay });

    if (idExtDeducc > 0) {
      setLoading(true);
      request.DELETE(`rrhh/process/weeklyPayrollDeductions/${idExtDeducc}`, (resp) => {
        onResetFormDeduc();
        setSendFormDeduc(false);

        // actualizar totales
        const newTotals = {
          externalDeductions: sumDeduc,
          totalDeductions: totalDeduc,
          totalPayment: totalPay
        }

        setLoading(true);
        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

    setExtDeducDetail(newData);
    setOpenMsgQuestion(false);
  }

  //guardar detalle de ingresos
  const fnAddIncomes = () => {
    setSendFormIncomes(true);
    if (!isFormValidIncomes) {
      return;
    }

    const filterTypes = listTypeIncomes.find(item => item.value === typeIdInc);

    const newIncome = {
      fatherId: id,
      typeId: typeIdInc,
      noAccount: filterTypes?.noAccount || '',
      days: daysInc,
      hours: hoursInc,
      value: validFloat(valueInc),
      description: descriptionInc
    }

    let allIncomes = [];
    if(idInc > 0){
      allIncomes = incomesDetail.filter(item => item.id !== idInc);
    }else{
      allIncomes = incomesDetail;
    }

    const totalInc = allIncomes.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0) + validFloat(valueInc);
    const totalPay = totalInc - validFloat(totalDeductions);
    const totalHours = allIncomes.map(item => validFloat(item.hours)).reduce((prev, curr) => prev + curr, 0) + validFloat(hoursInc);
    const sumDays = allIncomes.map(item => validFloat(item.days)).reduce((prev, curr) => prev + curr, 0) + validInt(daysInc) - daysVacationTaken;
    onBulkForm({ totalIncomes: totalInc, totalPayment: totalPay, hoursWorked: totalHours, daysWorked: sumDays });

    if (idInc === 0) {
      setLoading(true);
      request.POST('rrhh/process/weeklyPayrollIncomes', newIncome, (resp) => {
        setSendFormIncomes(false);
        onResetFormIncomes();
        fnGetIncomes();

        // actualizar totales
        const newTotals = {
          daysWorked: sumDays,
          totalIncomes: totalInc,
          totalPayment: totalPay
        }

        setLoading(true);
        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
        setLoading(false);

        // actualizar vacaciones del empleado cuando se genera una planilla de vacaciones
        if(typePayroll===4){
          fnNewVacations(daysInc, resp.data.id);
        }
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/weeklyPayrollIncomes/${idInc}`, newIncome, (resp) => {
        setSendFormIncomes(false);
        onResetFormIncomes();
        fnGetIncomes();

        // actualizar totales
        const newTotals = {
          daysWorked: sumDays,
          totalIncomes: totalInc,
          totalPayment: totalPay
        }

        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
        setLoading(false);

        // actualizar vacaciones del empleado cuando se genera una planilla de vacaciones
        if(typePayroll===4){
          fnUpdateVacations(daysInc, idInc);
        }
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  // editar ingresos
  const fnEditIncomes = (item) => {
    const newValue = {
      idInc: item.id,
      typeIdInc: item.typeId,
      noAccountInc: item.noAccount,
      daysInc: item.days,
      hoursInc: item.hours,
      valueInc: item.value,
      descriptionInc: item.description
    }
    onBulkFormIncomes(newValue);
  }

  const fnDeleteIncomes = (item) => {
    onBulkFormIncomes({ idInc: item.id });
    setOpenMsgDeleteIncomes(true);
  }

  const fnOkDeleteIncomes = () => {
    const newData = incomesDetail.filter((item) => {
      return item.id !== idInc;
    });

    const sumIncomes = newData.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    const sumHours = newData.map(item => validFloat(item.hours)).reduce((prev, curr) => prev + curr, 0);
    const sumDays = newData.map(item => validFloat(item.days)).reduce((prev, curr) => prev + curr, 0) - daysVacationTaken;
    const totalPay = sumIncomes - totalDeductions;
    onBulkForm({ totalIncomes: sumIncomes, totalPayment: totalPay, hoursWorked: sumHours, daysWorked: sumDays });

    if (idInc > 0) {
      setLoading(true);
      request.DELETE(`rrhh/process/weeklyPayrollIncomes/${idInc}`, (resp) => {
        onResetFormIncomes();
        setSendFormIncomes(false);

         // actualizar totales
         const newTotals = {
          daysWorked: sumDays,
          totalIncomes: sumIncomes,
          totalPayment: totalPay
        }

        setLoading(true);
        request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, newTotals, () => {
          fnViewDetailPayroll(currentItemDeta.fatherId);
          setLoading(false);
        }, (err) => {
          console.error(err);
          setLoading(false);
        });
        setLoading(false);

        // eliminar vacaciones ingresadas
        if(typePayroll===4){
          setLoading(true);
          request.DELETE(`rrhh/process/vacations?payrollId=${idInc}`, () => {
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
        }
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

    setIncomesDetail(newData);
    setOpenMsgDeleteIncomes(false);
  }

  const fnClearInputsIncomes = ()=>{
    onResetFormIncomes();
    setSendFormIncomes(false);
    setPercent(0);
  }

  const fnClearInputsDeductions = ()=>{
    onResetFormDeduc();
    setSendFormDeduc(false);
    setPercent(0);
  }

  const fnSaveDetailPayroll = () => {
    if(fatherId===0){
      return;
    }

    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newData = {
      fatherId,
      employeeId,
      jobPositionId,
      turnId,
      methodPaymentId,
      daysWorked,
      excusedAbsence,
      totalIncomes,
      internalDeductions,
      externalDeductions,
      totalDeductions,
      totalPayment,
      incWeekly,
      incOvertime,
      incValueHour,
      incOthers,
      deducIsr,
      deducIhss,
      deducRap,
      deducAbsence,
      deducTotal
    }

    if(id===0){
      setLoading(true);
      request.POST('rrhh/process/weeklyPayrollDetails', newData, (resp) => {
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

        //insertar deducciones
        extDeducDetail.forEach(newItem => {
          newItem.fatherId = resp.data.id
          setLoading(true);
          request.POST('rrhh/process/weeklyPayrollDeductions', newItem, (resp) => {
            fnGetDeductions();
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
        });

        //insertar detalle de ingresos
        incomesDetail.forEach(newIncome => {
          newIncome.fatherId = resp.data.id
          setLoading(true);
          request.POST('rrhh/process/weeklyPayrollIncomes', newIncome, (resp) => {
            fnGetIncomes();
            setLoading(false);
          }, (err) => {
            console.error(err);
            setLoading(false);
          });
        });

        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/weeklyPayrollDetails/${id}`, formState, () => {
        fnViewDetailPayroll(currentItemDeta.fatherId);
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnNewVacations = (days, idPayrollIncome) => {
    const daysVacations = validInt(days) || 0;

    // calcular rango de fechas para agregarlas en la tabla de vacaciones
    let daysSumMondays = 0;
    if(daysVacations===1){
      daysSumMondays = 0;
    }else if(daysVacations>6){
      const mondays = validInt(daysVacations/6);
      daysSumMondays = daysVacations + mondays;
    }else{
      daysSumMondays = daysVacations;
    }

    const dateInit = moment(dateStart);
    const date1 = moment(dateStart);
    let date2 = date1.add(daysSumMondays, 'days');

    // buscar si las fechas caen en dias feriados y agregarlos
    const hollyDays = fnCalcDaysVacations(dateInit, date2);
    date2 = date2.add(hollyDays, 'days');

    //confirmar que se agregaron la cantidad correcta de dias a la fecha
    const confirmDays = getDaysDiffExcMonday(dateInit, date2);
    if(confirmDays > daysVacations){
      const days = confirmDays - daysVacations;
      date2 = date2.subtract(days,'days');
    }

    const newData = {
      employeeId: currentItemDeta.employeeId,
      date: dateStart,
      dateStart: dateStart,
      dateEnd: date2.format("YYYY-MM-DD"),
      description: "VACACIONES PAGADAS",
      notes: notes,
      phoneContact: 0,
      authorizedById: userData.id,
      filePath: "",
      paidVacation: 1,
      status: 1,
      payrollId: idPayrollIncome
    }

    setLoading(true);
    request.POST('rrhh/process/vacations', newData, (resp) => {
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnUpdateVacations = (days, idPayrollIncome) => {
    const daysVacations = validInt(days) || 0;

    // calcular rango de fechas para agregarlas en la tabla de vacaciones
    let daysSumMondays = 0;
    if(daysVacations===1){
      daysSumMondays = 0;
    }else if(daysVacations>6){
      const mondays = validInt(daysVacations/6);
      daysSumMondays = daysVacations + mondays;
    }else{
      daysSumMondays = daysVacations;
    }

    const dateInit = moment(dateStart);
    const date1 = moment(dateStart);
    let date2 = date1.add(daysSumMondays, 'days');

    // buscar si las fechas caen en dias feriados y agregarlos
    const hollyDays = fnCalcDaysVacations(dateInit, date2);
    date2 = date2.add(hollyDays, 'days');

    //confirmar que se agregaron la cantidad correcta de dias a la fecha
    const confirmDays = getDaysDiffExcMonday(dateInit, date2);
    if(confirmDays > daysVacations){
      const days = confirmDays - daysVacations;
      date2 = date2.subtract(days,'days');
    }

    const newData = {
      date: dateStart,
      dateStart: dateStart,
      dateEnd: date2.format("YYYY-MM-DD"),
      notes: notes,
      paidVacation: 1,
      payrollId: idPayrollIncome
    }

    setLoading(true);
    request.PUT(`rrhh/process/vacations?payrollId=${idPayrollIncome}`, newData, (resp) => {
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    if(id>0){
      fnGetDeductions();
      fnGetIncomes();
      fnGetAttendance();
    }
  }, []);

  const propsToMsgDeleteDeducction = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteDeduction,
    fnOnNo: onResetFormDeduc,
    title: "alert.question.title"
  }

  const propsToMsgDeleteIncomes = {
    open: openMsgDeleteIncomes,
    setOpen: setOpenMsgDeleteIncomes,
    fnOnOk: fnOkDeleteIncomes,
    fnOnNo: onResetFormIncomes,
    title: "alert.question.title"
  }

  return (
    {
      activeTab,
      percent,
      disabledIhss,
      disabledRap,
      formState,
      formStateDeduc,
      formStateIncomes,
      formValidation,
      formValidationDeduc,
      formValidationIncomes,
      sendForm,
      sendFormDeduc,
      sendFormIncomes,
      extDeducDetail,
      incomesDetail,
      dataAttendance,
      onInputChange,
      onInputChangeDeduc,
      onInputChangeIncomes,
      onEmployeeChange,
      onDaysChange,
      onAbsenceChange,
      onOthersIncChange,
      onSevenIncChange,
      onIhssChange,
      onIsrChange,
      onRapChange,
      onPercentChange,
      onHoursChange,
      onDaysIncChange,
      setActiveTab,
      fnAddDeductionExternal,
      fnEditDeductionExternal,
      fnAddIncomes,
      fnDeleteDeductionExternal,
      fnEditIncomes,
      fnDeleteIncomes,
      fnSaveDetailPayroll,
      fnClearInputsIncomes,
      fnClearInputsDeductions,
      propsToMsgDeleteDeducction,
      propsToMsgDeleteIncomes
    }
  )
}
