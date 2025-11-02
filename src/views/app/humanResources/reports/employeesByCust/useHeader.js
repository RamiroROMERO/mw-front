import { useState } from 'react'
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import notification from '@Containers/ui/Notifications';

export const useHeader = ({setLoading, table, setTable, listCustomers, enableGenerateReport}) => {
  const [sendForm, setSendForm] = useState(false);
  const [listProjects, setListProjects] = useState([]);

  const validation = {
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    projectId: 0,
    turnId: 0
  }, validation);

  const {customerId, projectId, turnId} = formState;

  const onCustomerChange = e =>{
    const customer = e.target.value;

    setLoading(true);
    request.GET(`rrhh/process/projects?customerId=${customer}`, (resp)=>{
      const projects = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListProjects(projects);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });

    onBulkForm({customerId: customer});
  }

  const fnExportDocument = async()=>{
    const filterCustomer = listCustomers.find(item => item.value === customerId);
    setLoading(true);
    let data = {
      where: {
        customerId,
        status: 1
      },
      fields: [
        { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Proyecto', field: 'project', type: 'String', length: 100},
        { title: 'Turno', field: 'workShifts', type: 'String', length: 100},
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 40 }
      ],
      headerData: [
        { title: 'Cliente', description: filterCustomer.label }
      ],
      reportTitle: "Empleados por Cliente",
      nameXLSXFile: "EmpleadosPorCliente.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/projectDetail/exportReportXLXS", data, "EmpleadosPorCliente.xlsx");
    setLoading(false);
  }

  const fnGetData = ()=>{
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    let url = `rrhh/process/projectDetail?customerId=${customerId}&status=1`;

    if(projectId>0){
      url = `${url}&projectId=${projectId}`;
    }
    if(turnId>0){
      url = `${url}&turnId=${turnId}`;
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
      const projectDeta = resp.data.map((item, idx) => {
        item.num = idx + 1
        item.workShifts = item.rrhhSchedule?.name || ''
        item.employee = `${item.rrhhEmployee?.firstName || ''} ${item.rrhhEmployee?.secondName || ''} ${item.rrhhEmployee?.lastName || ''} ${item.rrhhEmployee?.secondLastName || ''}`
        item.project = item.rrhhProject?.name || ''
        return item;
      });
      setTable({ ...table, data: projectDeta, actions: [newActions] });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnClear = ()=>{
    onResetForm();
    setSendForm(false);
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      listProjects,
      onInputChange,
      onCustomerChange,
      fnGetData,
      fnClear
    }
  )
}
