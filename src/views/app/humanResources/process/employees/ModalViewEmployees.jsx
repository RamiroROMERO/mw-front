/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages, formatDate, validInt } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import ReactTable from '@Components/reactTable'
import { useModalViewEmployees } from './useModalViewEmployees'

const ModalViewEmployees = ({data, setOpen}) => {
  const {dataEmployees, setBulkForm, listMunicipality, setListFilterMunic, fnGetProjectEmployee, setLoading, fnGetImgEmployee} = data;

  const {fnExportXlsx} = useModalViewEmployees({setLoading});

  const fnViewEmployee = (itemEmpl)=>{
    const codeDepto = itemEmpl.departmentId;
    const filterMunic = listMunicipality.filter((item)=>{
      return item.codeDepto === codeDepto
    });
    filterMunic.unshift({value:'0', label:'Seleccione'});
    setListFilterMunic(filterMunic);

    itemEmpl.municipalityId = validInt(itemEmpl.municipalityId)

    setBulkForm(itemEmpl);
    fnGetProjectEmployee(itemEmpl.id);
    fnGetImgEmployee(itemEmpl.pathImage);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.viewEmployees.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "id",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.dni"),
        dataField: "dni",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: {width: "55%"}
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataEmployees,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewEmployee
      }
    ]
  });

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12}>
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={fnExportXlsx} className="mr-1 mb-1"><i className="bi bi-file-earmark-excel" /> {IntlMessages("button.export")}</Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalViewEmployees