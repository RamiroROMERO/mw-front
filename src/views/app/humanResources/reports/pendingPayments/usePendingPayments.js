import React, { useEffect, useState } from 'react'
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const usePendingPayments = ({setLoading, adminControl}) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.007")?.active || false;

  const [projectId, setProjectId] = useState(0);
  const [listProjects, setListProjects] = useState([]);

  const onProjectId = e =>{
    const idProject = e.target.value;
    setProjectId(idProject);
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
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.valueTotal"),
        dataField: "valueTotal",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.valueTotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.valuePaid"),
        dataField: "valuePaid",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.valuePaid, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.valuePending"),
        dataField: "valuePending",
        headerStyle: { width: "15%" },
        style: { textAlign: 'right' },
        cell: ({row}) => {
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

  const fnExportDocument = async()=>{
    let where = projectId>0?{projectId, status: 1}:{status: 1};
    setLoading(true);
    let data = {
      where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Fecha', field: 'date', type: 'String', length: 70},
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 70},
        { title: 'Descripcion', field: 'description', type: 'String', length: 120},
        { title: 'Valor Capital', field: 'valueCapital', type: 'decimal', length: 50, isSum: true, currency: true},
        { title: 'Valor Interés', field: 'valueInterest', type: 'decimal', length: 50, isSum: true, currency: true},
        { title: 'Valor Total', field: 'valueTotal', type: 'decimal', length: 50, isSum: true, currency: true},
        { title: 'Valor Pagado', field: 'valuePaid', type: 'decimal', length: 50, isSum: true, currency: true},
        { title: 'Valor Pendiente', field: 'valuePending', type: 'decimal', length: 50, isSum: true, currency: true}
      ],
      headerData: [],
      reportTitle: "Control de Pagos",
      nameXLSXFile: "ControlDePagos.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/paymentPlans/exportReportXLXS", data, "ControlDePagos.xlsx");
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

    let url = `rrhh/process/paymentPlans/getPendingPayment?status=1`;

    if(projectId>0){
      url = `${url}&projectId=${projectId}`;
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
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToHeader = {
    projectId,
    listProjects,
    onProjectId,
    fnGetData
  }

  return (
    {
      table,
      propsToHeader
    }
  )
}
