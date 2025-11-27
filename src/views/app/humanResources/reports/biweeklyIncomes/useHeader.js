import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({setLoading, table, setTable, enableGenerateReport}) => {

  const { formState, onInputChange } = useForm({
    projectId: 0,
    dateStart: '',
    dateEnd: ''
  });

  const {projectId, dateStart, dateEnd} = formState;

  const fnExportDocument = async()=>{
    let where = projectId>0?{projectId}:{};

    if(dateStart!=="" && dateEnd!==""){
      where = {
        status:1,
        dateStart,
        dateEnd
      }
    }

    if(projectId>0){
      where.projectId = projectId;
    }

    setLoading(true);
    let data = {
      where: where,
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 150 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 70},
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 120 },
        { title: 'Descripcion', field: 'description', type: 'String', length: 150},
        { title: 'Cantidad', field: 'qty', type: 'String', length: 50 },
        { title: 'Valor', field: 'value', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Fecha', field: 'date', type: 'String', length: 70},
      ],
      headerData: [],
      reportTitle: "Control de Ingresos Quincenales",
      nameXLSXFile: "ControlIngresosQuincenales.xlsx",
    };
    await request.fnExportToXLSX("rrhh/reports/getOthersIncomesXLSX", data, "ControlIngresosQuincenales.xlsx");
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

    let url = `rrhh/reports/getOthersIncomes?status=1`;

    if(projectId>0){
      url = `${url}&projectId=${projectId}`;
    }

    if(dateStart!=="" && dateEnd!==""){
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
