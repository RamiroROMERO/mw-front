import React, { useState } from 'react'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({ setLoading, table, setTable, enableGenerateReport }) => {
  const [employeeId, setEmployeeId] = useState(0);

  const onEmployeeId = e => {
    const emplId = e.target.value;
    setEmployeeId(emplId);
  }

  const fnExportDocument = async () => {
    const where = employeeId > 0 ? { employeeId, status: 1 } : { status: 1 };
    setLoading(true);
    let data = {
      where: where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 150 },
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 100 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 70 },
        { title: 'Estado', field: 'statusName', type: 'String', length: 50 },
        { title: 'Dias Ganados', field: 'daysGained', type: 'String', length: 70 },
        { title: 'Dias Pagados', field: 'daysTakenPaid', type: 'String', length: 70 },
        { title: 'Dias Descansados', field: 'daysTakenOff', type: 'String', length: 70 },
        { title: 'Total Dias Tomados', field: 'daysTaken', type: 'String', length: 70 },
        { title: 'Dias Pendientes', field: 'daysPending', type: 'String', length: 70 },
        { title: 'Pago Dias Pendientes', field: 'payDaysPending', type: 'decimal', currency: true, length: 70 }
      ],
      headerData: [],
      reportTitle: "Control de Vacaciones",
      nameXLSXFile: "ControlDeVacaciones.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/vacations/exportReportXLXS", data, "ControlDeVacaciones.xlsx");
    setLoading(false);
  }

  const fnGetData = () => {
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

    let url = `rrhh/process/vacations/getVacations`;

    if (employeeId > 0) {
      url = `${url}?employeeId=${employeeId}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const vacations = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.employee = item.employeeName
        return item;
      });
      setTable({ ...table, data: vacations, actions: [newActions] });
      setLoading(false);
    }, (err) => {

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
