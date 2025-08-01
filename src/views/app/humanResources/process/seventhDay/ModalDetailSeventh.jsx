import React, {useState, useEffect} from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { IntlMessages } from '@Helpers/Utils'
import { useForm } from '@Hooks';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import ModalEditDetail from './ModalEditDetail';

const ModalDetailSeventh = ({setOpen, data}) => {
  const {date, idFather, dataDetailSeventh, listEmployees, setLoading, fnGetDetail} = data;
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const {formState, onInputChange, onResetForm, setBulkForm} = useForm({
    id: 0,
    employeeId: 0,
    value: 0,
    notes: ''
  });

  const {id, employeeId, value, notes} = formState;

  const fnAddNewEmployee = ()=>{
    onResetForm();
    setOpenModalEdit(true);
  }

  const fnEditEmployee = (itemEmpl)=>{
    setBulkForm(itemEmpl);
    setOpenModalEdit(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.seventhDay.modal.viewDetail.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "70%"}
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "value",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.options"),
        dataField: "options",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditEmployee,
      },
      {
        color: "primary",
        icon: "plus",
        onClick: fnAddNewEmployee,
        title: IntlMessages("button.add"),
        isFreeAction: true
      }
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataDetailSeventh};
    setTable(dataTable);
  },[dataDetailSeventh]);

  const propsToModalDetailSeventh = {
    ModalContent: ModalEditDetail,
    title: "page.seventhDay.modal.editDetail.title",
    open: openModalEdit,
    setOpen: setOpenModalEdit,
    maxWidth: 'sm',
    data: {
      date,
      id,
      idFather,
      employeeId,
      value,
      notes,
      listEmployees,
      onInputChange,
      setLoading,
      fnGetDetail
    }
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    <Modal {...propsToModalDetailSeventh}/>
    </>
  )
}

export default ModalDetailSeventh