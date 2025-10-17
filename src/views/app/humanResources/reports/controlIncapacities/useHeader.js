import React, { useState } from 'react'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({setLoading, table, setTable, enableGenerateReport}) => {
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
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 100 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 70},
        { title: 'Estado', field: 'statusName', type: 'String', length: 50 },
        { title: 'Año', field: 'year', type: 'String', length: 70},
        { title: 'Mes', field: 'monthLetter', type: 'String', length: 70},
        { title: 'Dias de Incapacidad', field: 'daysIncapacities', type: 'String', length: 70},
        { title: 'Motivo', field: 'reason', type: 'String', length: 100 },
      ],
      headerData: [],
      reportTitle: "Control de Incapacidades",
      nameXLSXFile: "ControlDeIncapacidades.xlsx",
    };
    await request.fnExportToXLSX("rrhh/reports/exportIncapacitiesXLXS", data, "ControlDeIncapacidades.xlsx");
    setLoading(false);
  }

  const fnGetData = ()=>{
    // if (enableGenerateReport === false) {
    //   notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
    //   return;
    // }

    const newActions = {
      color: "primary",
      icon: "file-earmark-excel",
      onClick: fnExportDocument,
      title: "Exportar",
      isFreeAction: true
    }

    let url = `rrhh/reports/getIncapacitiesByMonth`;

    if(employeeId>0){
      url = `${url}?employeeId=${employeeId}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const data = resp.data.map((item) => {
        item.employee = item.employeeName
        return item;
      });
      setTable({ ...table, data, actions: [newActions] });
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
