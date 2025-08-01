/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useForm } from '@Hooks';
import { validFloat, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import notification from '@Containers/ui/Notifications';
import Modal from '@Components/modal';
import DetailEmployee from './DetailEmployee';
import FormEmployee from './FormEmployee';
import ModalViewHistory from './ModalViewHistory';
import ModalDocuments from './ModalDocuments';
import ModalDependents from './ModalDependents';
import ModalDeduccBonif from './ModalDeduccBonif';
import ModalBenefits from './ModalBenefits';
import ModalViewEmployees from './ModalViewEmployees';
import ModalBeneficiaries from './ModalBeneficiaries';
import ModalProjects from './ModalProjects';
import ModalChangeSalary from './ModalChangeSalary';
import ModalChangeStatus from './ModalChangeStatus';
import { PATH_FILES } from '/src/helpers/pathFiles';

const Content = (props) => {
  const { setLoading } = props;
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
    dni: [(val) => val.length > 12 && val.length <= 16, "msg.required.input.dni"],
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

  const { id, nationalityId, dni, firstName, secondName, lastName, secondLastName, birthday, genderId, civilStatusId, profession, cellPhone, telePhone, email, spouse, telSpouse, birthplace, phoneContact, nameContact, departmentId, municipalityId, colonyId, exactAddress, educationLevelId, ownsVehicle, typeVehicleId, vehiclePlate, dateIn, areaId, jobPositionId, immediateBossId, workScheduleId, contractTypeId, payrollTypeId, dateInContract, dateOutContract, defaultSalary, paymentMethod, bankPayment, accountNumber, condDiabetes, condHypertension, condVenerealDiseases, condHeartAttacks, condVisualImpairment, condHearingImpairment, condCerebroAccidents, condNeuroDisorders, condSteoDiseases, condOtherDiseases, condAllergies, deductionsIhss, deductionsIhssBiweekly, deductionsRap, deductionsRapBiweekly, status, areaManager, payOvertime, pathImage, shirtSize, pantSize, shoesSize } = formState;

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
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
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
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/employees/exportPDFEmployee', dataPrint, 'Ficha de Empleado.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  // const fnDeleteEmployee = () => {
  //   if (id > 0) {
  //     setOpenMsgQuestion(true);
  //   }
  // }

  const fnOkDeleteEmployee = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employees/${id}`, (resp) => {
      console.log(resp);
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewHistory = () => {
    if (id > 0) {
      setOpenModalHistory(true);
    }
  }

  const fnViewDocuments = () => {
    if (id > 0) {
      setOpenModalDocuments(true);
    }
  }

  const fnViewDependents = () => {
    if (id > 0) {
      setOpenModalDependents(true);
    }
  }

  const fnViewDeducBonif = () => {
    if (id > 0) {
      setOpenModalDeduccBonif(true);
    }
  }

  const fnViewBenefits = () => {
    if (id > 0) {
      setOpenModalBenefits(true);
    }
  }

  const fnViewBeneficiaries = () => {
    if (id > 0) {
      setOpenModalBeneficiaries(true);
    }
  }

  const fnViewProjects = () =>{
    if(id>0){
      setOpenModalProjects(true);
    }
  }

  const fnPrintCarnet = () => {
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
    request.GET('admin/areas?useRrhh=1', (resp) => {
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

  const propsToModalViewHistory = {
    ModalContent: ModalViewHistory,
    title: "page.employees.modal.viewHistory.title",
    open: openModalHistory,
    setOpen: setOpenModalHistory,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      dateIn,
      employeeName: `${firstName} ${secondName} ${lastName} ${secondLastName}`,
      setLoading
    }
  }

  const propsToModalDocuments = {
    ModalContent: ModalDocuments,
    title: "page.employees.modal.documents.title",
    open: openModalDocuments,
    setOpen: setOpenModalDocuments,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      setLoading
    }
  }

  const propsToModalDependents = {
    ModalContent: ModalDependents,
    title: "page.employees.modal.dependents.title",
    open: openModalDependents,
    setOpen: setOpenModalDependents,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      setLoading
    }
  }

  const propsToModalDeduccBonif = {
    ModalContent: ModalDeduccBonif,
    title: "page.employees.modal.deduccBonif.title",
    open: openModalDeduccBonif,
    setOpen: setOpenModalDeduccBonif,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      setLoading
    }
  }

  const propsToModalBenefits = {
    ModalContent: ModalBenefits,
    title: "page.employees.modal.benefits.title",
    open: openModalBenefits,
    setOpen: setOpenModalBenefits,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      setLoading
    }
  }

  const propsToModalViewEmployees = {
    ModalContent: ModalViewEmployees,
    title: "page.employees.modal.viewEmployees.title",
    open: openModalViewEmployees,
    setOpen: setOpenModalViewEmployees,
    maxWidth: 'lg',
    data: {
      dataEmployees,
      listMunicipality,
      setListFilterMunic,
      setBulkForm,
      fnGetProjectEmployee,
      setLoading,
      fnGetImgEmployee
    }
  }

  const propsToModalBeneficiaries = {
    ModalContent: ModalBeneficiaries,
    title: "page.employees.modal.beneficiaries.title",
    open: openModalBeneficiaries,
    setOpen: setOpenModalBeneficiaries,
    maxWidth: 'lg',
    data: {
      employeeId: id,
      setLoading
    }
  }

  const propsToModalProjects = {
    ModalContent: ModalProjects,
    title: "page.projects.table.title",
    open: openModalProjects,
    setOpen: setOpenModalProjects,
    maxWidth: 'xl',
    data: {
      employeeId: id,
      turnId: workScheduleId,
      listCustomers,
      listProjects,
      setLoading,
      fnGetProjects,
      fnGetProjectEmployee
    }
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteEmployee,
    title: "alert.question.title",
    // fnOnNo: onResetForm
  }

  const propsToModalChangeSalaries = {
    ModalContent: ModalChangeSalary,
    title: "page.employees.modal.changeSalaries.title",
    open: openModalChangeSalary,
    setOpen: setOpenModalChangeSalary,
    maxWidth: 'sm',
    data: {
      setLoading,
      listJobPositions
    }
  }

  const propsToModalChangeStatus = {
    ModalContent: ModalChangeStatus,
    title: "page.employees.modal.changeStatus.title",
    open: openModalChangeStatus,
    setOpen: setOpenModalChangeStatus,
    maxWidth: 'sm',
    data: {
      setLoading,
      employeeId: id,
      statusEmployee: status,
      setBulkForm
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <Row>
                <Colxx xxs="12" lg="4" xl="3">
                  <FormEmployee {...propsToFormEmployee} />
                </Colxx>
                <Colxx xxs="12" lg="8" xl="9">
                  <DetailEmployee {...propsToDetailEmployee} />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewHistory} />
      <Modal {...propsToModalDocuments} />
      <Modal {...propsToModalDependents} />
      <Modal {...propsToModalDeduccBonif} />
      <Modal {...propsToModalBenefits} />
      <Modal {...propsToModalViewEmployees} />
      <Modal {...propsToModalBeneficiaries} />
      <Modal {...propsToModalProjects}/>
      <Modal {...propsToModalChangeSalaries}/>
      <Modal {...propsToModalChangeStatus}/>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Content