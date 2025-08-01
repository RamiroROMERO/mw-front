import React, { useState } from 'react'
import { request } from '@Helpers/core';

export const useHeader = ({setLoading, table, setTable}) => {
  const [employeeId, setEmployeeId] = useState(0);

  const onEmployeeId = e =>{
    const emplId = e.target.value;
    setEmployeeId(emplId);
  }

  const fnExportDocument = async()=>{
    const where = employeeId>0?{employeeId}:{};
    setLoading(true);
    let data = {
      where: where,
      fields: [
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 150 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 70},
        { title: 'Dias Ganados', field: 'daysGained', type: 'String', length: 70},
        { title: 'Dias Pagados', field: 'daysTakenPaid', type: 'String', length: 70},
        { title: 'Dias Descansados', field: 'daysTakenOff', type: 'String', length: 70},
        { title: 'Total Dias Tomados', field: 'daysTaken', type: 'String', length: 70},
        { title: 'Dias Pendientes', field: 'daysPending', type: 'String', length: 70},
        { title: 'Pago Dias Pendientes', field: 'payDaysPending', type: 'decimal', currency: true, length: 70}
      ],
      headerData: [],
      reportTitle: "Control de Vacaciones",
      nameXLSXFile: "ControlDeVacaciones.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/vacations/exportReportXLXS", data, "ControlDeVacaciones.xlsx");
    setLoading(false);
  }

  const fnGetData = ()=>{

    const newActions = {
      color: "primary",
      icon: "file-earmark-excel",
      onClick: fnExportDocument,
      title: "Exportar",
      isFreeAction: true
    }

    let url = `rrhh/process/vacations/getVacations`;

    if(employeeId>0){
      url = `${url}?employeeId=${employeeId}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const vacations = resp.data.map((item) => {
        item.employee = item.employeeName
        return item;
      });
      setTable({ ...table, data: vacations, actions: [newActions] });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      employeeId,
      onEmployeeId,
      fnGetData
    }
  )
}
