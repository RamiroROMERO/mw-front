import { request } from '@Helpers/core';

export const useModalViewEmployees = ({setLoading}) => {

  const fnExportXlsx = async()=>{
    setLoading(true);
    const nameXLSXFile = "Empleados.xlsx";
    let data = {
      where: {},
      fields: [
        { title: 'N.', field: 'id', type: 'String', length: 20 },
        { title: 'Nacionalidad', field: 'nationalityName', type: 'String', length: 60 },
        { title: 'Identidad', field: 'dni', type: 'String', length: 60 },
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 140 },
        { title: 'Fecha de Nacimiento', field: 'birthday', type: 'String', length: 60 },
        { title: 'Género', field: 'genderName', type: 'String', length: 60 },
        { title: 'Estado Civil', field: 'civilStatusName', type: 'String', length: 60 },
        { title: 'Celular', field: 'cellPhone', type: 'String', length: 50 },
        { title: 'Teléfono', field: 'telePhone', type: 'String', length: 50 },
        { title: 'Correo', field: 'email', type: 'String', length: 90 },
        { title: 'Conyugue', field: 'spouse', type: 'String', length: 100 },
        { title: 'Teléfono Conyugue', field: 'telSpouse', type: 'String', length: 60 },
        { title: 'Lugar de Nacimiento', field: 'birthplace', type: 'String', length: 80 },
        { title: 'Contacto de Emergencia', field: 'nameContact', type: 'String', length: 80 },
        { title: 'Teléfono de Emergencia', field: 'phoneContact', type: 'String', length: 60 },
        { title: 'Departamento', field: 'departmentName', type: 'String', length: 60 },
        { title: 'Municipio', field: 'municipalityName', type: 'String', length: 60 },
        { title: 'Dirección Exacta', field: 'exactAddress', type: 'String', length: 100 },
        { title: 'Nivel Educativo', field: 'educationLevelName', type: 'String', length: 100 },
        { title: 'Profesión', field: 'profession', type: 'String', length: 70 },
        { title: 'Posee Vehículo', field: 'ownsVehicleName', type: 'String', length: 40 },
        { title: 'Tipo de Vehículo', field: 'typeVehicleName', type: 'String', length: 60 },
        { title: 'Placa', field: 'vehiclePlate', type: 'String', length: 60 },
        { title: 'Fecha Ingreso', field: 'dateIn', type: 'String', length: 40 },
        { title: 'Área', field: 'areaName', type: 'String', length: 60 },
        { title: 'Puesto de Trabajo', field: 'jobPositionName', type: 'String', length: 60 },
        { title: 'Jefe Inmediato', field: 'immediateBossName', type: 'String', length: 140 },
        { title: 'Horario de Trabajo', field: 'workScheduleName', type: 'String', length: 80 },
        { title: 'Tipo de Contrato', field: 'contractTypeName', type: 'String', length: 70 },
        { title: 'Nómina', field: 'payrollTypeName', type: 'String', length: 70 },
        { title: 'Salario', field: 'defaultSalary', type: 'String', length: 70 },
        { title: 'Forma de Pago', field: 'paymentMethodName', type: 'String', length: 70 },
        { title: 'Banco', field: 'bankPayment', type: 'String', length: 70 },
        { title: 'Número de Cuenta', field: 'accountNumber', type: 'String', length: 60 },
        { title: 'Pago de Horas Extras', field: 'payOvertimeName', type: 'String', length: 40 },
        { title: 'Enfermedades Crónicas', field: 'chronicDiseases', type: 'String', length: 120 },
        { title: 'Otras Enfermedades', field: 'condOtherDiseases', type: 'String', length: 60 },
        { title: 'Alergias', field: 'condAllergies', type: 'String', length: 60 },
        { title: 'Deducción IHSS', field: 'deductionsIhssName', type: 'String', length: 40 },
        { title: 'Quincena', field: 'deductionsIhssBiweeklyName', type: 'String', length: 60 },
        { title: 'Deducción RAP', field: 'deductionsRapName', type: 'String', length: 40 },
        { title: 'Quincena', field: 'deductionsRapBiweeklyName', type: 'String', length: 60 },
        { title: 'Jefe de Área', field: 'areaManagerName', type: 'String', length: 40 },
        { title: 'Proyecto', field: 'projectName', type: 'String', length: 70 },
        { title: 'Cliente', field: 'customerName', type: 'String', length: 120 },
        { title: 'Código en Proyecto', field: 'codeEmployee', type: 'String', length: 70 },
        { title: 'Talla Camisa', field: 'shirtSize', type: 'String', length: 60 },
        { title: 'Talla Pantalón', field: 'pantSize', type: 'String', length: 60 },
        { title: 'Talla Zapatos', field: 'shoesSize', type: 'String', length: 60 },
        { title: 'Status', field: 'statusName', type: 'String', length: 40 },
      ],
      headerData: [],
      reportTitle: "Reporte de Empleados",
      nameXLSXFile,
    };
    await request.fnExportToXLSX("rrhh/process/employees/exportReportXlsx", data, nameXLSXFile);
    setLoading(false);
  }

  return (
    {
      fnExportXlsx
    }
  )
}
