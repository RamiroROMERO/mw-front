/* eslint-disable react/prop-types */
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
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
import { useEmployees } from './useEmployees';

const Content = (props) => {
  const { setLoading, screenControl, adminControl } = props;

  const {id, firstName, secondName, lastName, secondLastName, status, dateIn, workScheduleId, listCustomers, listJobPositions, listMunicipality, listProjects, dataEmployees, openModalBeneficiaries, openModalBenefits, openModalChangeSalary, openModalChangeStatus, openModalDeduccBonif, openModalDependents, openModalDocuments, openModalProjects, openModalViewEmployees, openModalHistory, setBulkForm, propsToViewPDF, propsToPermissions, propsToVacations, propsToIncapacities, setListFilterMunic, setOpenModalBeneficiaries, setOpenModalBenefits, setOpenModalChangeSalary, setOpenModalChangeStatus, setOpenModalDeduccBonif, setOpenModalDependents, setOpenModalDocuments, setOpenModalProjects, setOpenModalViewEmployees, setOpenModalHistory, propsToControlPanel, propsToDetailEmployee, propsToFormEmployee, propsToMsgDelete, fnGetImgEmployee, fnGetProjectEmployee, fnGetProjects} = useEmployees({setLoading, screenControl, adminControl});

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
      <Modal {...propsToViewPDF} />
      <Modal {...propsToPermissions} />
      <Modal {...propsToVacations} />
      <Modal {...propsToIncapacities} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Content