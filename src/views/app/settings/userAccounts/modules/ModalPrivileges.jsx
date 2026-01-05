import React, { useState, useEffect } from "react";
import { Button, ModalBody, ModalFooter, Card, CardBody, Row, Form, } from "reactstrap";
import { IntlMessages, validInt } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { useForm } from "@Hooks";
import Confirmation from '@Containers/ui/confirmationMsg';
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from "@Components/simpleSelect";
import { Checkbox } from '@Components/checkbox';
import { InputField } from "@Components/inputFields";
import DataTable from "@Components/reactTable";

const listPrivileges = [{ id: 1, name: "General" }, { id: 2, name: "Admin" }];
const listOptions = [{ id: '01', name: 'Ajustes' }, { id: '02', name: 'Proceso' }, { id: '03', name: 'Reportes' }]

const ModalPrivileges = (props) => {
  const { data, setOpen } = props;
  const { currentItem, setLoading } = data;
  const [currentItemDeta, setCurrentItemDeta] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const privilegesValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.typePrivileges"],
    classificationId: [(val) => val.length > 0, "msg.required.select.classificationPrivileges"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    name: '',
    typeId: 0,
    classificationId: "",
    active: true
  }, privilegesValid);

  const { id, name, typeId, active, classificationId } = formState;

  const { nameValid, typeIdValid, classificationIdValid } = formValidation;

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  };

  const fnEditItem = (item) => {
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItemDeta(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.modules.privileges.table.title"),
    columns: [
      { text: IntlMessages("page.modules.privileges.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.modules.privileges.table.name"), dataField: "name", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.modules.privileges.table.typePrivilege"), dataField: "typePrivilege", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.modules.table.status"), dataField: "statusIcon", headerStyle: { 'width': '15%' } }
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
        onClick: fnEditItem,
      },
      // {
      //   color: "danger",
      //   icon: "trash",
      //   toolTip: IntlMessages("button.delete"),
      //   onClick: fnDeleteItem,
      // }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`admin/moduleDetail?moduleId=${currentItem.id}`, (resp) => {
      const dataDetail = resp.data.map((item) => {
        item.typePrivilege = item.typeId === 1 ? "General" : "Administrativo"
        item.statusIcon = item.active === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: dataDetail
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

    const dataPrivileges = {
      moduleId: currentItem.id,
      moduleCode: currentItem.code,
      name,
      typeId: validInt(typeId),
      classificationId,
      active
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/moduleDetail/${id}`, dataPrivileges, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/moduleDetail', dataPrivileges, (resp) => {
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
    request.DELETE(`admin/moduleDetail/${currentItemDeta.id}`, () => {
      fnGetData();
      setCurrentItemDeta({});
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem: setCurrentItemDeta }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-5">
              <CardBody>
                <Form>
                  <Row>
                    <Colxx xxs="6">
                      {/* <InputField
                        value={code}
                        name="code"
                        onChange={onInputChange}
                        type="text"
                        label="page.modules.privileges.input.code"
                        invalid={sendForm && !!codeValid}
                        feedbackText={sendForm && (codeValid || null)}
                      /> */}
                    </Colxx>
                    <Colxx xxs="12">
                      <InputField
                        value={name}
                        name="name"
                        onChange={onInputChange}
                        type="text"
                        label="page.modules.privileges.input.name"
                        invalid={sendForm && !!nameValid}
                        feedbackText={sendForm && (nameValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="6">
                      <SimpleSelect
                        value={classificationId}
                        name="classificationId"
                        onChange={onInputChange}
                        options={listOptions}
                        label="page.modules.privileges.select.typePrivileges"
                        invalid={sendForm && !!classificationIdValid}
                        feedbackText={sendForm && (classificationIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="6">
                      <SimpleSelect
                        value={typeId}
                        name="typeId"
                        onChange={onInputChange}
                        options={listPrivileges}
                        label="page.modules.privileges.select.clasificPrivileges"
                        invalid={sendForm && !!typeIdValid}
                        feedbackText={sendForm && (typeIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="active"
                        value={active}
                        label="page.modules.check.status"
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12" className="div-action-button-container">
                      <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                    </Colxx>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="12">
            <DataTable
              {...table}
            />
          </Colxx>
          <Confirmation {...propsToMsgDelete} />
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalPrivileges;