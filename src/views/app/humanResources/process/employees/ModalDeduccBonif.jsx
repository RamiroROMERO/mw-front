import React, { useState, useEffect } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { IntlMessages, validFloat, validInt } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Checkbox } from '@Components/checkbox'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';
import { RadioGroup } from '@Components/radioGroup'

const ModalDeduccBonif = ({data, setOpen}) => {
  const {employeeId, setLoading}=data;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const deduccBonifValid = {
    typeId: [(val)=> validInt(val)>0, "msg.required.select.type"],
    methodId: [(val)=> validInt(val)>0, "msg.required.select.method"],
    value: [(val)=>validFloat(val)>0, "msg.required.input.value"],
    name: [(val)=>val!=="", "msg.required.input.description"],
    biWeekly: [(val)=> validInt(val)>0, "msg.required.select.biWeekly"]
  }

  const {formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm} = useForm({
    id: 0,
    typeId: 0,
    methodId: 0,
    value: 0,
    name: '',
    biWeekly: 0,
    status: 1
  },deduccBonifValid);

  const {id, typeId, methodId, value, name, biWeekly, status} = formState;

  const {typeIdValid, methodIdValid, valueValid, nameValid, biWeeklyValid} = formValidation;

  const fnEditDeduction = (item)=>{
    setBulkForm(item);
  }

  const fnDeleteDeduction = (item)=>{
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.deduccBonif.title"),
    columns: [
      {
        text: IntlMessages("table.column.type"),
        dataField: "type",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "name",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
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
        onClick: fnEditDeduction
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDeduction,
      }
    ]
  });

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = ()=>{
    setLoading(true);
    request.GET(`rrhh/process/employeeDeducAllows?employeeId=${employeeId}`, (resp)=>{
      const deduction = resp.data.map((item)=>{
        item.type = item.typeId===1?'Deducción':'Bonificación'
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: deduction
      }
      setTable(tableData);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = ()=>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newData = {
      employeeId,
      typeId,
      methodId,
      value: validFloat(value),
      name,
      biWeekly,
      status
    }

    if(id === 0){
      setLoading(true);
      request.POST('rrhh/process/employeeDeducAllows', newData, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});
        fnClearInputs();
        fnGetData();
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/employeeDeducAllows/${id}`, newData, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employeeDeducAllows/${id}`, (resp) => {
      console.log(resp);
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    fnGetData();
  },[]);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" md="4">
          <SimpleSelect
            name="typeId"
            label='select.type'
            value={typeId}
            onChange={onInputChange}
            options={[
              {id:1,name:'Deducción'},
              {id:2,name:'Bonificación'}
            ]}
            invalid={sendForm && !!typeIdValid}
            feedbackText={sendForm && (typeIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" md="4">
          <SimpleSelect
            name="methodId"
            label='select.method'
            value={methodId}
            onChange={onInputChange}
            options={[
              {id:1,name:'Porcentaje'},
              {id:2,name:'Valor'}
            ]}
            invalid={sendForm && !!methodIdValid}
            feedbackText={sendForm && (methodIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" md="4">
          <InputField
            name='value'
            label='input.value'
            value={value}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!valueValid}
            feedbackText={sendForm && (valueValid || null)}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <InputField
            name='name'
            label='input.description'
            value={name}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!nameValid}
            feedbackText={sendForm && (nameValid || null)}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <RadioGroup
            label='page.employees.table.biWeekly'
            name='biWeekly'
            value={biWeekly}
            onChange={onInputChange}
            options={[
              {id:1, label:'page.employees.option.first'},
              {id:2, label:'page.employees.option.second'},
              {id:3, label:'page.employees.option.both'}
            ]}
            display="flex"
            invalid={sendForm && !!biWeeklyValid}
            feedbackText={sendForm && (biWeeklyValid || null)}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Checkbox
            label="check.status"
            name="status"
            value={status}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row className='mb-2'>
        <Colxx xxs="12" align="right">
          <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
          <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        </Colxx>
      </Row>
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
    <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalDeduccBonif