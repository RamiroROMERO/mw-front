import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import { useForm } from '@/hooks';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import TableButton from "@/components/tableButtons";

const ProductsTypes = (props) => {
  const { setLoading } = props;
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const productsTypesValid = {
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    status: true
  }, productsTypesValid);

  const { id, name, description, status } = formState;

  const { nameValid } = formValidation;

  const fnEditItem = (item) => {
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.productsTypes.table.title"),
    columns: [
      { text: IntlMessages("page.productsTypes.table.name"), dataField: "name", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.productsTypes.table.description"), dataField: "description", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.productsTypes.table.status"), dataField: "statusColor", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '15%' }, style: { textAlign: 'right' } }
    ],
    data: [],
    actions: []
  });

  const fnClearInputs = () => {
    onResetForm();
    setCurrentItem({});
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('prodProductTypes', (resp) => {
      const data = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
          statusColor: item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
            <i className="medium-icon bi bi-square" />,
          options: <><TableButton color='warning' icon='pencil' fnOnClick={() => fnEditItem(item)} />
            <TableButton color='danger' icon='trash' fnOnClick={() => fnDeleteItem(item)} /></>
        }
      })
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      status,
      description
    }
    if (id > 0) {
      setLoading(true);
      request.PUT(`prodProductTypes/${id}`, data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('prodProductTypes', data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`prodProductTypes/${currentItem.id}`, (resp) => {
      console.log(resp);
      fnGetData();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []) // eslint-disable-line react-@/hooks/exhaustive-deps

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.productsTypes.input.name"
                      invalid={sendForm && !!nameValid}
                      feedbackText={sendForm && (nameValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="12">
                    <InputField
                      value={description}
                      name="description"
                      onChange={onInputChange}
                      type="text"
                      label="page.productsTypes.input.description"
                    />
                  </Colxx>
                </Row>
                <Row className='mb-3'>
                  <Colxx xxs="12">
                    <Checkbox
                      name="status"
                      value={status}
                      label="page.productsTypes.check.status"
                      onChange={onInputChange}
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
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="8">
          <ReactTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
      </Row>
    </>
  );
}
export default ProductsTypes;