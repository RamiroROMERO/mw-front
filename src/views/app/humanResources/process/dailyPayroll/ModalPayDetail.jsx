import React, {useState, useEffect} from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, validFloat, validInt } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import createNotification from '@Containers/ui/Notifications'
import { Checkbox } from '@Components/checkbox'

const ModalPayDetail = ({data, setOpen}) => {
  const {idPayrollDeta, employeeId, date, regularHours, regularHourValue, regularValue, overtimeHours, overtimeHourValue,
    overtimeValue, total, entryTime, departureTime, dayTypeId, isHoliday, listEmployees, listDaysTypes, onInputChangeDeta, payrollDetail=null, setPayrollDetail=null, setBulkFormDeta, onResetFormDeta} = data;
  
  const [disabledEmployee, setDisabledEmployee] = useState(false);
  const [buttonText, setButtonText] = useState("button.add");
  const [buttonIcon, setButtonIcon] = useState("bi bi-plus");

  const onRegularHoursChange = e=>{
    const regHours = e.target.value;

    const totalReg = regHours * validFloat(regularHourValue);
    const totalPay = totalReg + validFloat(overtimeValue);

    const newHours = {
      regularHours: regHours,
      regularValue: totalReg,
      total: totalPay
    }

    setBulkFormDeta(newHours);
  }

  const onRegularHourValueChange = e=>{
    const valueHours = e.target.value;

    const totalReg = validFloat(regularHours) * valueHours;
    const totalPay = totalReg + validFloat(overtimeValue);

    const newValue = {
      regularHourValue: valueHours,
      regularValue: totalPay,
      total: totalPay
    }

    setBulkFormDeta(newValue);
  }

  const onOvertimeHoursChange = e=>{
    const overHours = e.target.value;

    const totalOver = overHours * validFloat(overtimeHourValue);
    const totalPay = totalOver + validFloat(regularValue);

    const newOverHour = {
      overtimeHours: overHours,
      overtimeValue: totalOver,
      total: totalPay
    }

    setBulkFormDeta(newOverHour);
  }

  const onOverHourValueChange = e=>{
    const valueOverHour = e.target.value;

    const totalOver = validFloat(overtimeHours) * valueOverHour;
    const totalPay = totalOver + validFloat(regularValue);

    const newOverValue = {
      overtimeHourValue: valueOverHour,
      overtimeValue: totalOver,
      total: totalPay
    }

    setBulkFormDeta(newOverValue);
  }

  const fnAddEmployee = ()=>{
    if(validInt(employeeId)===0){
      createNotification('warning','msg.required.select.employeeId', 'alert.warning.title');
      return;
    }
    if(regularHours===0){
      createNotification('warning','msg.required.input.regularHours', 'alert.warning.title');
      return;
    }
    if(regularHourValue===0){
      createNotification('warning','msg.required.input.regularHourValue', 'alert.warning.title');
      return;
    }

    const filterEmpl = listEmployees.filter((item)=>{
      return item.value === validInt(employeeId);
    });

    if(idPayrollDeta===0){
      const filterEmplSelected = payrollDetail.filter((item2)=>{
        return item2.employeeId === employeeId;
      });

      if(filterEmplSelected.length>0){
        createNotification('warning','msg.employeeRepeat', 'alert.warning.title');
        return;
      }
    }

    const newEmployee = {
      id: employeeId,
      date,
      employeeId,
      name: filterEmpl[0].label,
      jobPositionId: filterEmpl[0].jobPosition,
      regularHours,
      regularHourValue,
      regularValue,
      overtimeHours,
      overtimeHourValue,
      overtimeValue,
      total,
      dayTypeId,
      isHoliday
    }

    if(idPayrollDeta>0){
      payrollDetail.map((item)=>{
        if(item.id===idPayrollDeta){
          item.regularHours = validFloat(regularHours)
          item.regularHourValue = validFloat(regularHourValue)
          item.regularValue = validFloat(regularValue)
          item.overtimeHours = validFloat(overtimeHours)
          item.overtimeHourValue = validFloat(overtimeHourValue)
          item.overtimeValue = validFloat(overtimeValue)
          item.total = validFloat(total)
        }
        return item;
      });
    }else{
      setPayrollDetail(current => [...current, newEmployee]);
    }

    onResetFormDeta();
    setOpen(false);
  }

  useEffect(()=>{
    if(idPayrollDeta===0){
      setDisabledEmployee(false);
      setButtonText("button.add");
      setButtonIcon("bi bi-plus");
    }else{
      setDisabledEmployee(true);
      setButtonText("button.save");
      setButtonIcon("iconsminds-save");
    }
  },[]);

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" sm="6" md="8">
          <SearchSelect
            label='select.employee'
            name='employeeId'
            inputValue={employeeId}
            options={listEmployees}
            onChange={onInputChangeDeta}
            isDisabled={disabledEmployee}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" md="4">
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            disabled
          />
        </Colxx>
        <Colxx xxs="12" sm="7" md="8">
          <SearchSelect
            label='page.dailyReport.select.dayType'
            name='dayTypeId'
            inputValue={dayTypeId}
            options={listDaysTypes}
            onChange={onInputChangeDeta}
          />
        </Colxx>
        <Colxx xxs="12" sm="5" md="4" className="mb-3">
          <Checkbox
            label='check.isHoliday'
            name="isHoliday"
            value={isHoliday}
            onChange={onInputChangeDeta}
          />
        </Colxx>
      </Row>
      <hr/>
      <Row>
        <Colxx xxs="12" xs="6">
          <ContainerWithLabel label='page.dailyPayroll.modal.payDetail.label.regularSalary'>
            <Row>
              <Colxx xxs="12">
                <InputField
                  name='regularHours'
                  label='page.dailyPayroll.modal.manualPayroll.table.regularHours'
                  value={regularHours}
                  onChange={onRegularHoursChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='regularHourValue'
                  label='page.dailyPayroll.modal.manualPayroll.table.valueHour'
                  value={regularHourValue}
                  onChange={onRegularHourValueChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='regularValue'
                  label='input.total'
                  value={regularValue}
                  onChange={onInputChangeDeta}
                  type='text'
                  disabled
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs="12" xs="6">
          <ContainerWithLabel label='page.dailyPayroll.modal.payDetail.label.extraordinarySalary'>
            <Row>
              <Colxx xxs="12">
                <InputField
                  name='overtimeHours'
                  label='page.dailyPayroll.modal.manualPayroll.table.overtimeHours'
                  value={overtimeHours}
                  onChange={onOvertimeHoursChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='overtimeHourValue'
                  label='page.dailyPayroll.modal.manualPayroll.table.valueOvertime'
                  value={overtimeHourValue}
                  onChange={onOverHourValueChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='overtimeValue'
                  label='input.total'
                  value={overtimeValue}
                  onChange={onInputChangeDeta}
                  type='text'
                  disabled
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="4">
          <InputField
            name='entryTime'
            label='page.dailyPayroll.modal.manualPayroll.table.entryTime'
            value={entryTime}
            onChange={onInputChangeDeta}
            type='text'
            disabled
          />
        </Colxx>
        <Colxx xxs="12" md="4">
          <InputField
            name='departureTime'
            label='page.dailyPayroll.modal.manualPayroll.table.departureTime'
            value={departureTime}
            onChange={onInputChangeDeta}
            type='text'
            disabled
          />
        </Colxx>
        <Colxx xxs="12" md={4}>
          <InputField
            name='total'
            label='input.totalPayment'
            value={total}
            onChange={onInputChangeDeta}
            type='text'
            disabled
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnAddEmployee}>
        <i className={buttonIcon}/> {IntlMessages(buttonText)}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalPayDetail