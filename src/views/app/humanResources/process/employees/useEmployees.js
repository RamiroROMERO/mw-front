import React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { getCurrentDate, validFloat, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { PATH_FILES } from '/src/helpers/pathFiles';

export const useEmployees = ({ setLoading, screenControl, adminControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const enableChangeSalary = adminControl.find(ctrl => ctrl.code === "07.02.002")?.active || false;
  const [codeEmployee, setCodeEmployee] = useState(0);
  const [imgEmployee, setImgEmployee] = useState('');
  const [listDepartments, setListDepartments] = useState([]);
  const [listMunicipality, setListMunicipality] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listJobPositions, setListJobPositions] = useState([]);
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [listSchedules, setListSchedules] = useState([]);
  const [listFilterMunic, setListFilterMunic] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [dataEmployees, setDataEmployees] = useState([]);
  const [openModalHistory, setOpenModalHistory] = useState(false);
  const [openModalDocuments, setOpenModalDocuments] = useState(false);
  const [openModalDependents, setOpenModalDependents] = useState(false);
  const [openModalDeduccBonif, setOpenModalDeduccBonif] = useState(false);
  const [openModalBenefits, setOpenModalBenefits] = useState(false);
  const [openModalViewEmployees, setOpenModalViewEmployees] = useState(false);
  const [openModalBeneficiaries, setOpenModalBeneficiaries] = useState(false);
  const [openModalProjects, setOpenModalProjects] = useState(false);
  const [openModalChangeSalary, setOpenModalChangeSalary] = useState(false);
  const [openModalChangeStatus, setOpenModalChangeStatus] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const employeeValid = {
    nationalityId: [(val) => validInt(val) > 0, "msg.required.select.nationality"],
    dni: [(val) => /^\d{13}$/.test(val)
      && validInt(val.substring(0, 2), 10) > 0
      && validInt(val.substring(0, 2), 10) < 19
      && validInt(val.substring(2, 4), 10) > 0
      && validInt(val.substring(2, 4), 10) < 30
      && validInt(val.substring(4, 8), 10) > 1900,
      "msg.required.input.dni"],
    firstName: [(val) => val !== "", "msg.required.input.firstName"],
    lastName: [(val) => val !== "", "msg.required.input.lastName"],
    birthday: [(val) => val !== "", "msg.required.select.birthday"],
    genderId: [(val) => validInt(val) > 0, "msg.required.select.gender"],
    civilStatusId: [(val) => validInt(val) > 0, "msg.required.select.civilStatus"],
    cellPhone: [(val) => val !== "", "msg.required.input.phone"],
    nameContact: [(val) => val !== "", "msg.required.input.emergencyContact"],
    phoneContact: [(val) => val !== "", "msg.required.input.emergencyPhone"],
    departmentId: [(val) => validInt(val) > 0, "msg.required.select.department"],
    municipalityId: [(val) => validInt(val) > 0, "msg.required.select.municipality"],
    exactAddress: [(val) => val !== "", "msg.required.input.exactAddress"],
    educationLevelId: [(val) => validInt(val) > 0, "msg.required.select.educationLevelId"],
    dateIn: [(val) => val !== "", "msg.required.select.dateIn"],
    jobPositionId: [(val) => validInt(val) > 0, "msg.required.select.jobPosition"],
    workScheduleId: [(val) => validInt(val) > 0, "msg.required.select.workSchedule"],
    contractTypeId: [(val) => validInt(val) > 0, "msg.required.select.contractType"],
    payrollTypeId: [(val) => validInt(val) > 0, "msg.required.select.payrollType"],
    defaultSalary: [(val) => validFloat(val) > 0, "msg.required.input.defaultSalary"],
    paymentMethod: [(val) => validInt(val) > 0, "msg.required.select.paymentMethod"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    nationalityId: 0,
    dni: '',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    birthday: '',
    genderId: 0,
    civilStatusId: 0,
    profession: '',
    cellPhone: '',
    telePhone: '',
    email: '',
    spouse: '',
    telSpouse: '',
    birthplace: '',
    nameContact: '',
    phoneContact: '',
    departmentId: '',
    municipalityId: 0,
    colonyId: '',
    exactAddress: '',
    educationLevelId: 0,
    ownsVehicle: 0,
    typeVehicleId: 0,
    vehiclePlate: '',
    dateIn: '',
    areaId: 0,
    jobPositionId: 0,
    immediateBossId: 0,
    workScheduleId: 0,
    contractTypeId: 0,
    payrollTypeId: 0,
    dateInContract: '',
    dateOutContract: '',
    defaultSalary: 0,
    paymentMethod: 0,
    bankPayment: '',
    accountNumber: '',
    condDiabetes: 0,
    condHypertension: 0,
    condVenerealDiseases: 0,
    condHeartAttacks: 0,
    condVisualImpairment: 0,
    condHearingImpairment: 0,
    condCerebroAccidents: 0,
    condNeuroDisorders: 0,
    condSteoDiseases: 0,
    condOtherDiseases: '',
    condAllergies: '',
    deductionsIhss: 2,
    deductionsIhssBiweekly: 0,
    deductionsRap: 2,
    deductionsRapBiweekly: 0,
    status: 1,
    areaManager: 0,
    payOvertime: 0,
    pathImage: 'usuario.png',
    shirtSize: '',
    pantSize: '',
    shoesSize: ''
  }, employeeValid);

  const { id, nationalityId, dni, firstName, secondName, lastName, secondLastName, birthday, genderId, civilStatusId, profession,cellPhone, telePhone, email, spouse, telSpouse, birthplace, phoneContact, nameContact, departmentId, municipalityId, colonyId, exactAddress, educationLevelId, ownsVehicle, typeVehicleId, vehiclePlate, dateIn, areaId, jobPositionId, immediateBossId, workScheduleId, contractTypeId, payrollTypeId, dateInContract, dateOutContract, defaultSalary, paymentMethod, bankPayment, accountNumber, condDiabetes, condHypertension, condVenerealDiseases, condHeartAttacks, condVisualImpairment, condHearingImpairment, condCerebroAccidents, condNeuroDisorders, condSteoDiseases, condOtherDiseases, condAllergies, deductionsIhss, deductionsIhssBiweekly, deductionsRap, deductionsRapBiweekly, status, areaManager, payOvertime, pathImage, shirtSize, pantSize, shoesSize } = formState;

  const fnNewEmployee = () => {
    onResetForm();
    fnGetImgEmployee("usuario.png");
    setCodeEmployee("");
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/employees', (resp) => {
      const employees = resp.data.map((item) => {
        item.name = `${item.firstName}  ${item.secondName}  ${item.lastName}  ${item.secondLastName}`
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataEmployees(employees);
      setOpenModalViewEmployees(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSearchEmployees = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    fnGetData();
  }

  const fnSaveEmployee = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      nationalityId,
      dni,
      firstName,
      secondName,
      lastName,
      secondLastName,
      birthday,
      genderId,
      civilStatusId,
      profession,
      cellPhone,
      telePhone,
      email,
      spouse,
      telSpouse,
      birthplace,
      nameContact,
      phoneContact,
      departmentId,
      municipalityId,
      colonyId,
      exactAddress,
      educationLevelId,
      ownsVehicle,
      typeVehicleId,
      vehiclePlate,
      dateIn,
      areaId,
      jobPositionId,
      immediateBossId,
      workScheduleId,
      contractTypeId,
      payrollTypeId,
      dateInContract: dateInContract === "" ? '1900-01-01' : dateInContract,
      dateOutContract: dateOutContract === "" ? '1900-01-01' : dateOutContract,
      defaultSalary: validFloat(defaultSalary),
      paymentMethod,
      bankPayment,
      accountNumber,
      condDiabetes,
      condHypertension,
      condVenerealDiseases,
      condHeartAttacks,
      condVisualImpairment,
      condHearingImpairment,
      condCerebroAccidents,
      condNeuroDisorders,
      condSteoDiseases,
      condOtherDiseases,
      condAllergies,
      deductionsIhss,
      deductionsIhssBiweekly,
      deductionsRap,
      deductionsRapBiweekly,
      status,
      areaManager,
      payOvertime,
      pathImage,
      shirtSize,
      pantSize,
      shoesSize
    }

    if (id === 0) {
      // buscar si ya se ingreso el empleado
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.GET(`rrhh/process/employees?dni=${dni}`, (resp) => {
        const employees = resp.data;
        setLoading(false);

        if(employees.length>0){
          notification('warning', 'msg.warning.employee.registered', 'alert.warning.title');
          return;
        }

        request.POST('rrhh/process/employees', newData, (resp) => {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
          setLoading(false);
          fnGetAreaManager();

          // guardar historial
          const dataHistory = {
            date: getCurrentDate(),
            employeeId: resp.data.id,
            reason: 'Primer Ingreso',
            status: true,
            isHireable: true
          }
          setLoading(true);
          request.POST('rrhh/process/employeeHistory', dataHistory, () => {
          }, (err) => {
            console.error(err);
            setLoading(false);
          }, false);

        }, (err) => {
          console.error(err);
          setLoading(false);
        });

      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/employees/${id}`, newData, () => {
        setLoading(false);
        fnGetAreaManager();
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintEmployee = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/employees/exportPDFEmployee', dataPrint, 'Ficha de Empleado.pdf', () => {
        setLoading(false);
      });
    }
  }

  const fnOkDeleteEmployee = () =>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employees/${id}`, () => {
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewHistory = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalHistory(true);
    }
  }

  const fnViewDocuments = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalDocuments(true);
    }
  }

  const fnViewDependents = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalDependents(true);
    }
  }

  const fnViewDeducBonif = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalDeduccBonif(true);
    }
  }

  const fnViewBenefits = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalBenefits(true);
    }
  }

  const fnViewBeneficiaries = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenModalBeneficiaries(true);
    }
  }

  const fnViewProjects = () =>{
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if(id>0){
      setOpenModalProjects(true);
    }
  }

  const fnPrintCarnet = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    const employeesId = [
      { id }
    ]
    if (id > 0) {
      request.GETPdf('rrhh/process/employees/exportPDFCarnet', { employeesId }, 'Carnet de Empleado.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnGetAreaManager = ()=>{
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?areaManager=1', (resp) => {
      const immediateBoss = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
        }
      });
      setListImmediateBoss(immediateBoss);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetProjects = ()=>{
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id,
          customerId: item.customerId,
          code: item.code,
          corre: item.corre
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetProjectEmployee = (idEmpl)=>{
    setLoading(true);
    request.GET(`rrhh/process/projectDetail?employeeId=${idEmpl}&status=1`, (resp)=>{
      const dataProjects = resp.data;
      setCodeEmployee(dataProjects[0]?.codeEmployee || 0);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnChangeSalary = () => {
    if (enableChangeSalary === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setOpenModalChangeSalary(true);
  }

  const fnChangeStatus = () => {
    if (id > 0) {
      setOpenModalChangeStatus(true);
    }
  }

  const fnGetImgEmployee = async (nameImg)=>{
    const name = nameImg !== "" ? nameImg : 'usuario.png'
    const imageUrl = `${PATH_FILES.GET.PROFILES}${name}`;
    const imageObjectURL = await request.getFile(imageUrl);

    setImgEmployee(imageObjectURL);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/locateDeptos/getSL', (resp) => {
      const deptos = resp.data.map((item) => {
        return {
          value: item.code,
          label: item.name
        }
      });
      setListDepartments(deptos);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/locateMunic/getSL', (resp) => {
      const munic = resp.data.map((item) => {
        return {
          value: item.id,
          code: item.code,
          label: item.name,
          codeDepto: item.codeDepto
        }
      });
      setListMunicipality(munic);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/areas/getSl?useRrhh=1', (resp) => {
      const areas = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListAreas(areas);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/settings/jobPositions', (resp) => {
      const positions = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListJobPositions(positions);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const schedules = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListSchedules(schedules);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    fnGetProjects();

    fnGetAreaManager();

    fnGetImgEmployee(pathImage);
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewEmployee,
    fnSearch: fnSearchEmployees,
    fnSave: fnSaveEmployee,
    fnPrint: fnPrintEmployee,
    // fnDelete: fnDeleteEmployee,
    buttonsHome: [
      {
        title: "button.history",
        icon: "bi bi-person-lines-fill",
        onClick: fnViewHistory
      },
      {
        title: "button.documents",
        icon: "bi bi-file-earmark-person",
        onClick: fnViewDocuments
      },
      {
        title: "button.dependents",
        icon: "bi bi-people",
        onClick: fnViewDependents
      },
      {
        title: "button.deducBonif",
        icon: "bi bi-cash-coin",
        onClick: fnViewDeducBonif
      },
      {
        title: "button.benefits",
        icon: "bi bi-list-check",
        onClick: fnViewBenefits
      },
      {
        title: "button.beneficiaries",
        icon: "bi bi-people-fill",
        onClick: fnViewBeneficiaries
      },
      {
        title: "button.projects",
        icon: "bi bi-clipboard-check",
        onClick: fnViewProjects
      },
      {
        title: "button.changeStatus",
        icon: "bi bi-toggles",
        onClick: fnChangeStatus
      }
    ],
    buttonsOptions: [
      {
        title: "button.printCarnet",
        icon: "bi bi-person-badge",
        onClick: fnPrintCarnet
      },
      {
        title: "button.changeSalary",
        icon: "bi bi-arrow-down-up",
        onClick: fnChangeSalary
      }
    ],
    buttonsAdmin: []
  }

  const propsToDetailEmployee = {
    civilStatusId,
    profession,
    cellPhone,
    telePhone,
    email,
    spouse,
    telSpouse,
    birthplace,
    nameContact,
    phoneContact,
    departmentId,
    municipalityId,
    colonyId,
    exactAddress,
    educationLevelId,
    ownsVehicle,
    typeVehicleId,
    vehiclePlate,
    dateIn,
    areaId,
    jobPositionId,
    immediateBossId,
    workScheduleId,
    contractTypeId,
    payrollTypeId,
    dateInContract,
    dateOutContract,
    defaultSalary,
    paymentMethod,
    bankPayment,
    accountNumber,
    condDiabetes,
    condHypertension,
    condVenerealDiseases,
    condHeartAttacks,
    condVisualImpairment,
    condHearingImpairment,
    condCerebroAccidents,
    condNeuroDisorders,
    condSteoDiseases,
    condOtherDiseases,
    condAllergies,
    deductionsIhss,
    deductionsIhssBiweekly,
    deductionsRap,
    deductionsRapBiweekly,
    payOvertime,
    shirtSize,
    pantSize,
    shoesSize,
    listDepartments,
    listMunicipality,
    listAreas,
    listJobPositions,
    listImmediateBoss,
    listSchedules,
    listFilterMunic,
    setListFilterMunic,
    onInputChange,
    setBulkForm,
    formValidation,
    sendForm
  }

  const propsToFormEmployee = {
    codeEmployee,
    nationalityId,
    dni,
    firstName,
    secondName,
    lastName,
    secondLastName,
    birthday,
    genderId,
    status,
    areaManager,
    pathImage,
    onInputChange,
    setBulkForm,
    formValidation,
    sendForm,
    imgEmployee,
    fnGetImgEmployee
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteEmployee,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      id,
      firstName,
      secondName,
      lastName,
      secondLastName,
      workScheduleId,
      status,
      dateIn,
      listCustomers,
      listProjects,
      listMunicipality,
      listJobPositions,
      dataEmployees,
      openModalDocuments,
      openModalDependents,
      openModalDeduccBonif,
      openModalBenefits,
      openModalViewEmployees,
      openModalBeneficiaries,
      openModalProjects,
      openModalChangeSalary,
      openModalChangeStatus,
      openModalHistory,
      setOpenModalDocuments,
      setOpenModalDependents,
      setOpenModalDeduccBonif,
      setOpenModalBenefits,
      setOpenModalViewEmployees,
      setOpenModalBeneficiaries,
      setOpenModalProjects,
      setOpenModalChangeSalary,
      setOpenModalChangeStatus,
      setOpenModalHistory,
      setListFilterMunic,
      setBulkForm,
      propsToControlPanel,
      propsToDetailEmployee,
      propsToFormEmployee,
      propsToMsgDelete,
      fnGetProjects,
      fnGetProjectEmployee,
      fnGetImgEmployee
    }
  )
}
