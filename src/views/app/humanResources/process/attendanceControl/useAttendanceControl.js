import React, { useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { cleanedObjectKeys, ExcelErrors, formatDate, getExcelData } from '@Helpers/Utils';
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import moment from 'moment';
import { request } from '@Helpers/core';

export const useAttendanceControl = ({ setLoading }) => {
  const [sendForm, setSendForm] = useState(false);
  const [nameFile, setNameFile] = useState(IntlMessages("button.chooseFile"));
  const [dataAttendance, setDataAttendance] = useState([]);

  const AttendanceControlValid = {
    dateIn: [(val) => val !== '', "msg.required.select.dateStart"],
    dateOut: [(val) => val !== '', "msg.required.select.dateEnd"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    dateIn: '',
    dateOut: ''
  }, AttendanceControlValid);

  const { dateIn, dateOut } = formState;

  const fnClearInputs = () => {
    onResetForm();
    setNameFile("");
    setDataAttendance([]);
    setSendForm(false);
  }

  const fnImportExcel = event => {
    setLoading(true);
    const file = event.target.files?.[0];
    setNameFile(file.name);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const data = e.target?.result;

        // get excel data
        const requiredColumns = ['Nombre', 'Número de empleado'];
        const priceCalculateColumns = [];
        const startColumn = "A"; const startRow = 2;
        const endColumn = "R"; const endRow = 1000;
        const excelData = getExcelData(
          data, requiredColumns,
          priceCalculateColumns,
          startColumn, startRow,
          endColumn, endRow,
          false
        );
        if (excelData?.error === ExcelErrors.ISEMPTY) {
          // fetchError(messages["error.message.excelIsEmpty"] as string);
          console.log("excelIsEmpty");
          return;
        }
        if (excelData?.error === ExcelErrors.DONTHASVALIDCOLUMN) {
          // fetchError(messages["error.message.excelDontHasValidColumn"] as string);
          console.log("excelDontHasValidColumn");
          return;
        }
        if (excelData?.error === ExcelErrors.ALLZEROVALUES) {
          // fetchError(messages["error.message.excelAllZeroValues"] as string);
          console.log("excelAllZeroValues");
          return;
        }

        const dataFormatted = excelData.data.map((item) => {
          const cleanedItem = cleanedObjectKeys(item);
          return {
            employeeId: cleanedItem["Número de empleado"],
            employeeName: cleanedItem["Nombre"],
            date: cleanedItem["Fecha"],
            input: cleanedItem["Entrada"],
            output: cleanedItem["Salida"],
            timeWorked: cleanedItem["Tiempo trabajado"]
          }
        });

        setDataAttendance(dataFormatted);
        setLoading(false);
      }
      reader.readAsBinaryString(file);
    }
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const initDate = formatDate(dateIn);
    const endDate = formatDate(dateOut);

    if (dataAttendance.length === 0) {
      notification('warning', 'msg.required.data.attendanceControl', 'alert.warning.title');
      return;
    }

    // validar que los datos esten entre el rango de fechas seleccionado
    const filterData = dataAttendance.filter(item => item.date >= initDate && item.date <= endDate);

    if (filterData.length === 0) {
      notification('warning', 'msg.required.dataAttendance.filterData', 'alert.warning.title');
      return;
    }

    const dataToSave = filterData.map(item => {
      const fecha = moment(item.date, 'DD/MM/YYYY');
      item.date = fecha.format("YYYY-MM-DD")
      item.input = item?.input || "00:00"
      item.output = item?.output || "00:00"
      return item;
    });

    setLoading(true);
    request.POST('rrhh/proccess/attendanceControl/createMany', dataToSave, (resp) => {
      fnClearInputs();
      setLoading(false);
    }, (err) => {
      fnClearInputs();

      setLoading(false);
    });

  }

  const propsToHeader = {
    nameFile,
    formState,
    formValidation,
    sendForm,
    onInputChange,
    fnClearInputs,
    fnImportExcel,
    fnSave
  }

  return (
    {
      propsToHeader,
      dataAttendance
    }
  )
}
