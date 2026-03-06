import { useState } from 'react'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { useForm } from '@/hooks';
import { API_URLS } from '@/helpers/APIUrl';

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
    let where = employeeId > 0 ? { employeeId } : {};

    if (dateStart !== "" && dateEnd !== "") {
      where = {
        status: 1,
        dateStart,
        dateEnd
      }
    }

    setLoading(true);
    let data = {
      where: where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 150 },
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 100 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 50 },
        { title: 'Estado', field: 'statusName', type: 'String', length: 50 },
        { title: 'Dias de Ausencias', field: 'days', type: 'String', length: 70 },
        { title: 'Motivo', field: 'reason', type: 'String', length: 100 },
        { title: 'Tipo de Aplicacion', field: 'description', type: 'String', length: 60 },
        { title: 'Fecha Inicio', field: 'startDate', type: 'String', length: 50 },
        { title: 'Fecha Final', field: 'endDate', type: 'String', length: 50 },
      ],
      headerData: [],
      reportTitle: "Control de Ausencias",
      nameXLSXFile: "ControlDeAusencias.xlsx",
    };
    await request.fnExportToXLSX(`${API_URLS.RRHH_REP_ABSENCES_CONTROL_XLSX}`, data, "ControlDeAusencias.xlsx");
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

    let url = `${API_URLS.RRHH_REP_ABSENCES_CONTROL}?status=1`;

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
      onEmployeeId,
      onInputChange,
      fnGetData
    }
  )
}
