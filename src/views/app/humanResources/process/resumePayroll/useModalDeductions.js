import React, { useEffect, useState } from 'react'
import { validFloat, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useModalDeductions = ({idPayroll, dataDetailPayroll, setLoading, setOpen, fnViewDetailPayroll, listTypeDeductions}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const deductionsValid = {
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    description: [(val) => val !== "", "msg.required.input.description"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    fatherId: 0,
    typeId: 0,
    noAccount: 0,
    value: 0,
    description: ''
  }, deductionsValid);

  const {typeId, value, description} = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.employees.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "label",
        headerStyle: { width: "100%" }
      },
    ],
    data: [],
    options: {
      pageSize: 5,
      enabledRowSelection: true,
      enabledActionButtons: false,
      setRowSelected: setSelectedItems
    }
  });

  const fnSave = ()=>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if (selectedItems.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const filterTypes = listTypeDeductions.find(item => item.value === typeId);

    const newData = selectedItems.map(item => {
      return {
        fatherId: item.value,
        typeId,
        noAccount: filterTypes?.noAccount || '',
        description,
        value
      }
    });

    // actualizar detalle de planilla
    selectedItems.forEach(element => {
      const findDetail = dataDetailPayroll.find((item)=>item.id===element.value);

      const totalExtDeduc = validFloat(value) + validFloat(findDetail.externalDeductions);
      const totalDeduc = validFloat(value) + validFloat(findDetail.totalDeductions);
      const totalPay = validFloat(findDetail.totalIncomes) - totalDeduc;
      const dataUpdate = {
        externalDeductions: totalExtDeduc,
        totalDeductions: totalDeduc,
        totalPayment: totalPay
      }

      setLoading(true);
      request.PUT(`rrhh/process/weeklyPayrollDetails/${element.value}`, dataUpdate, () => {
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      },false);
    });

    setLoading(true);
    request.POST('rrhh/process/weeklyPayrollDeductions/createMany', newData, (resp) => {
      onResetForm();
      setSelectedItems([]);
      fnViewDetailPayroll(idPayroll);
      setOpen(false);
      setLoading(false);
    },(err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    const listEmployeesByPayroll = dataDetailPayroll.map((item)=>{
      return {
        idPayrollDeta: item.id,
        value: item.id,
        label: item.employee
      }
    });
    const dataTable = {...table, data: listEmployeesByPayroll};
    setTable(dataTable);
  },[]);

  return (
    {
      formState,
      formValidation,
      sendForm,
      onInputChange,
      table,
      fnSave
    }
  )
}
