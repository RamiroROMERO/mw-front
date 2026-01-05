import { useState } from 'react'
import { request } from '@Helpers/core';
import { useForm } from '@/hooks';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({ setLoading, table, setTable, enableGenerateReport }) => {
  const [employeeId, setEmployeeId] = useState(0);

  const { formState, onInputChange } = useForm({
    dateStart: '',
    dateEnd: ''
  });

  const { dateStart, dateEnd } = formState;

  const onEmployeeId = e => {
    const emplId = e.target.value;
    setEmployeeId(emplId);
  }

  const fnExportDocument = async () => {
    let where = employeeId > 0 ? { employeeId, status: 1 } : { status: 1 };

    if (dateStart !== "" && dateEnd !== "") {
      where = {
        status: 1,
        dateStart,
        dateEnd,
        employeeId
      }
    }

    setLoading(true);
    let data = {
      where: where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 140 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 50 },
        { title: 'Puesto de Trabajo', field: 'jobPosition', type: 'String', length: 70 },
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 150 },
        { title: 'Total Ingresos', field: 'totalIncomes', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Total Deducciones', field: 'totalDeductions', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Total Pago', field: 'totalPayment', type: 'decimal', length: 50, isSum: true, currency: true },
      ],
      headerData: [],
      reportTitle: "Historial de Pagos",
      nameXLSXFile: "HistorialDePagos.xlsx",
    };
    await request.fnExportToXLSX("rrhh/reports/exportPaymentsHistoryXLSX", data, "HistorialDePagos.xlsx");
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

    let url = `rrhh/reports/getPaymentsHistory?status=1`;

    if (employeeId > 0) {
      url = `${url}&employeeId=${employeeId}`;
    }

    if (dateStart !== "" && dateEnd !== "") {
      url = `${url}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const data = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.employee = item.employeeName
        return item;
      });
      setTable({ ...table, data, actions: [newActions] });
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  return (
    {
      formState,
      employeeId,
      onInputChange,
      onEmployeeId,
      fnGetData
    }
  )
}
