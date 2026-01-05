import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Button, Form, } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import { useForm } from '@/hooks';
import DataTable from "@/components/reactTable";
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import ModalPrivileges from './ModalPrivileges';

const Modules = (props) => {
  const { setLoading } = props;
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openModalPrivileges, setOpenModalPrivileges] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const modulesValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    code: '',
    name: '',
    active: true
  }, modulesValid);

  const { id, code, name, active } = formState;

  const { codeValid, nameValid } = formValidation;

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  };

  const fnEditItem = (item) => {
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const fnModalPrivileges = (item) => {
    setCurrentItem(item);
    setOpenModalPrivileges(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.modules.table.title"),
    columns: [
      { text: IntlMessages("page.modules.table.code"), dataField: "code", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.modules.table.name"), dataField: "name", headerStyle: { 'width': '60%' } },
      { text: IntlMessages("page.modules.table.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' } }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "list",
        toolTip: IntlMessages("button.privileges"),
        onClick: fnModalPrivileges,
      },
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
    request.GET('admin/modules', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data
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

    const data = {
      name,
      code,
      active
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/modules/${id}`, data, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/modules', data, (resp) => {
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
    request.DELETE(`admin/modules/${currentItem.id}`, (resp) => {
      fnGetData();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  const propsToModalPrivileges = {
    ModalContent: ModalPrivileges,
    title: "page.modules.modal.privileges.title",
    open: openModalPrivileges,
    setOpen: setOpenModalPrivileges,
    maxWidth: 'lg',
    data: {
      currentItem,
      setLoading
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12">
                    <InputField
                      value={code}
                      name="code"
                      onChange={onInputChange}
                      type="text"
                      label="page.modules.input.code"
                      invalid={sendForm && !!codeValid}
                      feedbackText={sendForm && (codeValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.modules.input.name"
                      invalid={sendForm && !!nameValid}
                      feedbackText={sendForm && (nameValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12">
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
        <Colxx xxs="12" xs="12" sm="12" md="8">
          <DataTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
        <Modal {...propsToModalPrivileges} />
      </Row>
    </>
  );
}
export default Modules;