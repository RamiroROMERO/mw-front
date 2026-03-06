import React, { useEffect, useState } from 'react'
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { API_URLS } from '@/helpers/APIUrl';

export const usePendingBenefits = ({ setLoading, adminControl }) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.007")?.active || false;
  const [listEmployees, setListEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(0);

  const onEmployeeId = e => {
    const emplId = e.target.value;
    setEmployeeId(emplId);
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.pendingPayments"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.valueTotal"),
        dataField: "valueTotal",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.valueTotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.valuePaid"),
        dataField: "valuePaid",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.valuePaid, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.valuePending"),
        dataField: "valuePending",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.valuePending, '', 2));
        }
      }
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  const fnExportDocument = async () => {
    let where = employeeId > 0 ? { employeeId, status: 1 } : { status: 1 };
    setLoading(true);
    let data = {
      where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Fecha', field: 'date', type: 'String', length: 70 },
        { title: 'Descripcion', field: 'description', type: 'String', length: 120 },
        { title: 'Valor Total', field: 'valueTotal', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Valor Pagado', field: 'valuePaid', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Valor Pendiente', field: 'valuePending', type: 'decimal', length: 50, isSum: true, currency: true }
      ],
      headerData: [],
      reportTitle: "Control de Pagos de Prestaciones",
      nameXLSXFile: "ControlDePagosPrestaciones.xlsx",
    };
    await request.fnExportToXLSX(`${API_URLS.RRHH_REP_PENDING_BENEFITS_XLSX}`, data, "ControlDePagosPrestaciones.xlsx");
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

    let url = `${API_URLS.RRHH_REP_PENDING_BENEFITS}?status=1`;

    if (employeeId > 0) {
      url = `${url}&employeeId=${employeeId}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const pendingPayments = resp.data.map((item) => {
        item.employee = item.employeeName
        return item;
      });
      setTable({ ...table, data: pendingPayments, actions: [newActions] });
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToHeader = {
    employeeId,
    listEmployees,
    onEmployeeId,
    fnGetData
  }

  return (
    {
      table,
      propsToHeader
    }
  )
}
