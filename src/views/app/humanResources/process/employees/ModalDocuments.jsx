import React, { useState, useEffect } from 'react'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { Checkbox } from '@Components/checkbox'
import UploadFile from '@Components/uploadFile'
import ReactTable from '@Components/reactTable'
import createNotification from '@Containers/ui/Notifications'
import Confirmation from '@Containers/ui/confirmationMsg';

const ModalDocuments = ({ data, setOpen }) => {
  const { employeeId, setLoading } = data;
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const documentsValid = {
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    notes: '',
    status: 1
  }, documentsValid);

  const { id, name, description, notes, status } = formState;

  const { nameValid } = formValidation;

  const fnEditDocument = (item) => {
    setBulkForm(item);
    setFilePath(item.filePath);
  }

  const fnDeleteDocument = (item) => {
    setBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.documents.title"),
    columns: [
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "35%" }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: { width: "55%" }
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
        onClick: fnEditDocument,
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDocument,
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/employeeDocuments?employeeId=${employeeId}`, (resp) => {
      const documents = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: documents
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    onResetForm();
    setFilePath("");
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (filePath === "") {
      createNotification('warning', 'msg.required.input.file', 'alert.warning.title');
      return;
    }

    const newData = {
      employeeId,
      name,
      description,
      notes,
      filePath,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/employeeDocuments', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/employeeDocuments/${id}`, newData, () => {
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
    request.DELETE(`rrhh/process/employeeDocuments/${id}`, (resp) => {
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
                  label='page.employees.modal.documents.input.documentName'
                  value={name}
                  onChange={onInputChange}
                  type='text'
                  invalid={sendForm && !!nameValid}
                  feedbackText={sendForm && (nameValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='description'
                  label='input.description'
                  value={description}
                  onChange={onInputChange}
                  type='textarea'
                  style={{ resize: 'none' }}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name='notes'
                  label='input.observations'
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
            <Row>
              <Colxx xxs="12">
                <UploadFile
                  filePath={filePath}
                  setFilePath={setFilePath}
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row className='mt-3'>
          <Colxx xxs="12">
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

export default ModalDocuments