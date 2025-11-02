import { request } from '@Helpers/core';
import { useState } from 'react'
import notification from '@Containers/ui/Notifications';

export const useHeader = ({setLoading, table, setTable, enableGenerateReport}) => {
  const [employeeId, setEmployeeId] = useState(0);
  const [salaryParam, setSalaryParam] = useState(true);
  const [bankAccountParam, setBankAccountParam] = useState(false);

  const onEmployeeId = e =>{
    const emplId = e.target.value;
    setEmployeeId(emplId);
  }

  const onSalaryChange = e =>{
    const value = e.target.checked;
    setSalaryParam(value);
  }

  const onBankAccountChange = e =>{
    const value = e.target.checked;
    setBankAccountParam(value);
  }

  const fnExportDocument = async()=>{
    const where = employeeId>0?{id: employeeId, status: 1}:{status: 1};
    const nameXLSXFile = "Reporte de Salarios y Cuentas Bancarias.xlsx";

    let otherFields = [];

    if(salaryParam === true){
      otherFields.push({ title: 'Salario', field: 'defaultSalary', type: 'String', length: 70 });
    }

    if(bankAccountParam === true){
      otherFields.push({ title: 'Número de Cuenta', field: 'accountNumber', type: 'String', length: 60 });
    }

    let data = {
      where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Identidad', field: 'dni', type: 'String', length: 60 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 140 },
        { title: 'Código en Proyecto', field: 'codeEmployee', type: 'String', length: 70 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 40 },
        ...otherFields,
        { title: 'Status', field: 'statusName', type: 'String', length: 40 }
      ],
      headerData: [],
      reportTitle: "Reporte de Salarios y Cuentas Bancarias",
      nameXLSXFile,
    };
    await request.fnExportToXLSX("rrhh/process/employees/exportReportXlsx", data, nameXLSXFile);
    setLoading(false);
  }

  const fnGetData = ()=>{
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }

    const newActions = {
      color: "primary",
      icon: "file-earmark-excel",
      onClick: fnExportDocument,
      title: "Exportar",
      isFreeAction: true
    }

    let url = `rrhh/process/employees?status=1`;

    if(employeeId>0){
      url = `${url}&id=${employeeId}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const dataEmployees = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.employee = `${item.firstName}  ${item.secondName}  ${item.lastName}  ${item.secondLastName}`
        return item;
      });
      setTable({ ...table, data: dataEmployees, actions: [newActions] });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      employeeId,
      salaryParam,
      bankAccountParam,
      onEmployeeId,
      onSalaryChange,
      onBankAccountChange,
      fnGetData
    }
  )
}
