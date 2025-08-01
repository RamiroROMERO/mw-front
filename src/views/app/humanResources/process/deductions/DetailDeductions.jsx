import React, { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import ReactTable from '@Components/reactTable';
import notification from '@Containers/ui/Notifications';

const DetailDeductions = ({id, date, employeeName, typeId, value, description, projectId, setProjectId, onProjectChange, onResetForm, listEmployeesByProject, listTypeDeductions, listProjects, onInputChange, fnGetData, setLoading, formValidation, isFormValid}) => {
  const [sendForm, setSendForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const {dateValid, typeIdValid, valueValid, descriptionValid} = formValidation;

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

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
    setProjectId(0);
  }

  const fnSave = () =>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if (id === 0 && selectedItems.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const updateData = {
      date,
      typeId,
      description,
      value
    }

    const newData = selectedItems.map(item => {
      return {
        employeeId: item.value,
        typeId,
        date,
        description,
        value
      }
    });

    if(id === 0){
      setLoading(true);
      request.POST('rrhh/process/deductions/createMany', newData, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});
        fnGetData();
        fnClearInputs();
        setProjectId(0);
        setSelectedItems([]);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/deductions/${id}`, updateData, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(()=>{
    const dataTable = {...table, data: listEmployeesByProject};
    setTable(dataTable);
  },[listEmployeesByProject, projectId]);

  return (
    <Card>
      <CardBody>
        <Row>
          <Colxx xxs="12" md="7" lg="6" xxl="7">
            <Row>
              <Colxx xxs="12" style={{ display: employeeName === "" ? 'none' : 'block' }}>
                <InputField
                  name="employeeName"
                  label='select.employee'
                  value={employeeName}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs={12}>
                <SearchSelect
                  label='select.project'
                  name='projectId'
                  inputValue={projectId}
                  options={listProjects}
                  onChange={onProjectChange}
                />
              </Colxx>
              <Colxx xxs={12}>
                <ReactTable {...table}/>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" md="5" lg="6" xxl="5">
            <Row>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <DateCalendar
                  name="date"
                  value={date}
                  label='select.date'
                  onChange={onInputChange}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && (dateValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <InputField
                  name="value"
                  label='input.value'
                  value={value}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!valueValid}
                  feedbackText={sendForm && (valueValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="12" lg="12">
                <SearchSelect
                  label='select.typeId'
                  name='typeId'
                  inputValue={typeId}
                  options={listTypeDeductions}
                  onChange={onInputChange}
                  invalid={sendForm && !!typeIdValid}
                  feedbackText={sendForm && (typeIdValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="12" lg="12">
                <InputField
                  name="description"
                  label='input.description'
                  value={description}
                  onChange={onInputChange}
                  type="textarea"
                  invalid={sendForm && !!descriptionValid}
                  feedbackText={sendForm && (descriptionValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnClearInputs}>
                  <i className="bi bi-stars"/> {IntlMessages("button.clear")}
                </Button>
                <Button color="primary" onClick={fnSave}>
                  <i className="iconsminds-save"/> {IntlMessages("button.save")}
                </Button>
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailDeductions