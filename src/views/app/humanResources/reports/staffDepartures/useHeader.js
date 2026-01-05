import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({ setLoading, table, setTable, enableGenerateReport }) => {

  const { formState, onInputChange } = useForm({
    dateStart: '',
    dateEnd: ''
  });

  const { dateStart, dateEnd } = formState;

  const fnExportDocument = async () => {
    let where = { status: 0 };

    if (dateStart !== "" && dateEnd !== "") {
      where = {
        status: 0,
        dateStart,
        dateEnd
      }
    }
    setLoading(true);
    let data = {
      where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 100 },
        { title: 'Puesto', field: 'jobPositionName', type: 'String', length: 100 },
        { title: 'Salario', field: 'defaultSalary', type: 'decimal', length: 50 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 40 },
        { title: 'Fecha Salida', field: 'date', type: 'String', length: 40 },
        { title: 'Motivo', field: 'reason', type: 'String', length: 120 },
        { title: 'Estado', field: 'statusName', type: 'String', length: 40 },
        { title: 'Es Contratable', field: 'hireable', type: 'String', length: 50 }
      ],
      headerData: [],
      reportTitle: "Reporte de Egresos de Personal",
      nameXLSXFile: "EgresosDePersonal.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/employeeHistory/exportInactivesXlsx", data, "EgresosDePersonal.xlsx");
    setLoading(false);
  }

  const fnGetData = () => {
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    let url = `rrhh/process/employeeHistory/findInactives?status=0`;

    if (dateStart !== "" && dateEnd !== "") {
      url = `${url}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
    }

    const newActions = {
      color: "primary",
      icon: "file-earmark-excel",
      onClick: fnExportDocument,
      title: "Exportar",
      isFreeAction: true
    }

    setLoading(true);
    request.GET(url, (resp) => {
      const employees = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.employee = `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}  ${item.rrhhEmployee.secondLastName}`
        item.dateIn = item.rrhhEmployee.dateIn
        item.hireable = item.isHireable === true ? 'Si' : 'No'
        item.statusName = item.status === true ? 'Activo' : 'Inactivo'
        return item;
      });
      setTable({ ...table, data: employees, actions: [newActions] });
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  return (
    {
      formState,
      onInputChange,
      fnGetData
    }
  )
}
