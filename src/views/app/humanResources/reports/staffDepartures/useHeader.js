import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';

export const useHeader = ({setLoading, table, setTable}) => {

  const { formState, onInputChange } = useForm({
    dateStart: '',
    dateEnd: ''
  });

  const {dateStart, dateEnd} = formState;

  const fnExportDocument = async()=>{
    let where = "status=0";

    if(dateStart!=="" && dateEnd!==""){
      where = `${where}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
    }
    setLoading(true);
    let data = {
      where,
      fields: [
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Fecha', field: 'date', type: 'String', length: 40},
        { title: 'Motivo', field: 'reason', type: 'String', length: 120},
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

  const fnGetData = ()=>{
    let url = `rrhh/process/employeeHistory/findInactives?status=0`;

    if(dateStart!=="" && dateEnd!==""){
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
      const employees = resp.data.map((item) => {
        item.employee = `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}  ${item.rrhhEmployee.secondLastName}`
        item.hireable = item.isHireable === true ? 'Si' : 'No'
        item.statusName = item.status === true ? 'Activo' : 'Inactivo'
        return item;
      });
      setTable({ ...table, data: employees, actions: [newActions] });
      setLoading(false);
    }, (err) => {
      console.error(err);
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
