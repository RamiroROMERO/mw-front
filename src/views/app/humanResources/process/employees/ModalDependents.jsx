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
import UploadFile from '@Components/uploadFile'
import Confirmation from '@Containers/ui/confirmationMsg';

const ModalDependents = ({ data, setOpen }) => {
  const { employeeId, setLoading } = data;
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const dependentsValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    age: [(val) => validFloat(val) > 0, "msg.required.input.age"],
    parentId: [(val) => validInt(val) > 0, "msg.required.select.relationship"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    age: 0,
    parentId: 0,
    genderId: 0,
    disability: '',
    notes: '',
    status: 1
  }, dependentsValid);

  const { id, name, age, parentId, genderId, disability, notes, status } = formState;

  const { nameValid, ageValid, parentIdValid } = formValidation;

  const fnEditDependents = (item) => {
    setBulkForm(item);
    setFilePath(item.filePath);
  }

  const fnDeleteDependent = (item) => {
    setBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.dependents.title"),
    columns: [
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("page.employees.modal.dependents.select.relationship"),
        dataField: "parentName",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("input.age"),
        dataField: "age",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("page.employees.select.gender"),
        dataField: "gender",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: { width: "10%" }
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
        onClick: fnEditDependents
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDependent,
      }
    ]
  });

  const fnClearInputs = () => {
    onResetForm();
    setFilePath("");
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/employeeDependents?employeeId=${employeeId}`, (resp) => {
      const dependents = resp.data.map((item) => {
        item.parentName = item.rrhhParent ? item.rrhhParent.name : ''
        item.gender = item.rrhhGender ? item.rrhhGender.name : ''
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: dependents
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      employeeId,
      name,
      age: validFloat(age),
      parentId,
      genderId,
      disability,
      notes,
      filePath,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/employeeDependents', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/employeeDependents/${id}`, newData, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employeeDependents/${id}`, (resp) => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

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
          <Colxx xxs="12" sm="8" md="9">
            <Row>
              <Colxx xxs="12">
                <InputField
                  name='name'
                  label='input.name'
                  value={name}
                  onChange={onInputChange}
                  type='text'
                  invalid={sendForm && !!nameValid}
                  feedbackText={sendForm && (nameValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="5">
                <InputField
                  name='age'
                  label='input.age'
                  value={age}
                  onChange={onInputChange}
                  type='text'
                  invalid={sendForm && !!ageValid}
                  feedbackText={sendForm && (ageValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="7">
                <SimpleSelect
                  name="parentId"
                  label='page.employees.modal.dependents.select.relationship'
                  value={parentId}
                  onChange={onInputChange}
                  options={[
                    { id: 1, name: 'Hijo(a)' },
                    { id: 2, name: 'Esposo(a)' },
                    { id: 3, name: 'Madre' },
                    { id: 4, name: 'Padre' },
                    { id: 5, name: 'Hermano(a)' },
                  ]}
                  invalid={sendForm && !!parentIdValid}
                  feedbackText={sendForm && (parentIdValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="5">
                <SimpleSelect
                  name="genderId"
                  label='page.employees.select.gender'
                  value={genderId}
                  onChange={onInputChange}
                  options={[
                    { id: 1, name: 'Masculino' },
                    { id: 2, name: 'Femenino' }
                  ]}
                />
              </Colxx>
              <Colxx xxs="12" sm="7">
                <InputField
                  name='disability'
                  label='page.employees.modal.dependents.input.disability'
                  value={disability}
                  onChange={onInputChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='notes'
                  label='input.comments'
                  value={notes}
                  onChange={onInputChange}
                  type='textarea'
                  style={{ resize: 'none' }}
                />
              </Colxx>
              <Colxx xxs="12">
                <Checkbox
                  label="check.status"
                  name="status"
                  value={status}
                  onChange={onInputChange}
                />
              </Colxx>
              <Colxx xxs="12" align="right">
                <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" sm="4" md="3" className="mt-3">
            <UploadFile
              filePath={filePath}
              setFilePath={setFilePath}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className='mt-3'>
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalDependents