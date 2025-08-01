import React from 'react'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { Button, Row, Table } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, validInt } from '@Helpers/Utils'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import createNotification from '@Containers/ui/Notifications'
import { Checkbox } from '@Components/checkbox'

const TableEmployees = ({date, employeeId, dayTypeId, isHoliday, listEmployees, listDaysTypes, employeesDetail, setEmployeesDetail, onInputChangeDeta, onResetFormDeta}) => {

  const fnAddEmployee = ()=>{
    if(validInt(employeeId)===0){
      createNotification('warning','msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const filterEmpl = listEmployees.filter((item)=>{
      return item.value === validInt(employeeId);
    });

    const filterEmplSelected = employeesDetail.filter((item2)=>{
      return item2.employeeId === employeeId;
    });

    const filterDayType = listDaysTypes.find(item3 => item3.value === validInt(dayTypeId));

    if(filterEmplSelected.length>0){
      createNotification('warning','msg.employeeRepeat', 'alert.warning.title');
      return;
    }

    const newEmployee = {
      id: employeeId,
      date,
      employeeId,
      dayTypeId,
      dayTypeName: filterDayType?.label || "",
      isHoliday,
      name: filterEmpl[0].label
    }

    setEmployeesDetail(current => [...current, newEmployee]);
    onResetFormDeta();
  }

  const fnDeleteEmployee = (item2)=>{
    const newData = employeesDetail.filter((item)=>{
      return item.employeeId !== item2.employeeId;
    });
    setEmployeesDetail(newData);
  }

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label='page.dailyReport.label.addEmployees'>
          <Row>
            <Colxx xxs="12" xl="12">
              <SearchSelect
                label='select.employee'
                name='employeeId'
                inputValue={employeeId}
                options={listEmployees}
                onChange={onInputChangeDeta}
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
            <Colxx xxs="12" xl="12" className='mb-2' align="right">
              <Button color="primary" onClick={fnAddEmployee}>
                <i className='bi bi-plus'/> {IntlMessages("button.add")}
              </Button>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <Table bordered hover size='sm'>
                <thead>
                  <tr>
                    <th width="60%">{IntlMessages('page.dailyReport.table.nameEmployee')}</th>
                    <th width="20%">{IntlMessages('page.dailyReport.select.dayType')}</th>
                    <th width="10%">{IntlMessages('check.isHoliday')}</th>
                    <th width="10%">{IntlMessages('table.column.options')}</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesDetail.map((item,idx) =>{
                    return (
                      <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                        <td>{item.name}</td>
                        <td>{item.dayTypeName}</td>
                        <td>{(validInt(item.isHoliday) === 1 || item.isHoliday === true)?<i className="medium-icon bi bi-check2-square"/>:<i className="medium-icon bi bi-square"/>}</td>
                        <td align='right'>
                          <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                            onClick={() => {fnDeleteEmployee(item)}} key={`buttons-${idx}`}>
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
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default TableEmployees