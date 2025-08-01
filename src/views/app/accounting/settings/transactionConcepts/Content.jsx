import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Row } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { useForm } from '@/hooks';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { request } from '@/helpers/core';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import ReactTable from '@/components/reactTable';
import TableButton from '@/components/tableButtons';
import Confirmation from '@/containers/ui/confirmationMsg';

const TransactionConcepts = (props) => {
  const { setLoading } = props;
  const [listAccount, setListAccount] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const conceptsValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    idCtaCont: [(val) => val !== "" && val !== "0", "msg.required.input.IdCtaAccount"]
  }

  const { formState, formValidation, isFormValid, onResetForm, setBulkForm, onInputChange } = useForm({
    id: 0,
    name: '',
    idCtaCont: '',
    status: true
  }, conceptsValid);

  const { id, name, idCtaCont, status } = formState;

  const { nameValid, idCtaContValid } = formValidation;

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  }

  const fnEditItem = (item) => {
    console.log(item)
    setBulkForm(item);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.transactionConcepts.table.title"),
    columns: [
      { text: IntlMessages("page.transactionConcepts.table.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.transactionConcepts.table.status"), dataField: "statusIcon", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '25%' }, style: { textAlign: 'right' } }
    ],
    data: [],
    actions: []
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('accounting/settings/transactionConcepts', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        item.options =
          <><TableButton color='warning' icon='pencil' fnOnClick={() => fnEditItem(item)} />
            <TableButton color='danger' icon='trash' fnOnClick={() => fnDeleteItem(item)} /></>
        return item;
      });
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

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const data = {
      id,
      name,
      status,
      idCtaCont
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`accounting/settings/transactionConcepts/${id}`, data, (resp) => {
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
      request.POST('accounting/settings/transactionConcepts', data, (resp) => {
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
    request.DELETE(`accounting/settings/transactionConcepts/${currentItem.id}`, (resp) => {
      console.log(resp);
      fnGetData();
      fnClearInputs();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListAccount(account);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <Row className='mb-3'>
                <Colxx xss="12" sm="6" lg="12" xl="6">
                  <InputField
                    name="name"
                    value={name}
                    onChange={onInputChange}
                    label="page.transactionConcepts.input.name"
                    type="text"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xss="12" sm="6" lg="12" xl="6">
                  <SearchSelect
                    name="idCtaCont"
                    inputValue={idCtaCont}
                    label="page.transactionConcepts.select.idCtaCont"
                    onChange={onInputChange}
                    options={listAccount}
                    invalid={sendForm && !!idCtaContValid}
                    feedbackText={sendForm && (idCtaContValid || null)}
                  />
                </Colxx>
                <Colxx xss="12">
                  <Checkbox
                    name="status"
                    value={status}
                    onChange={onInputChange}
                    label="page.transactionConcepts.chekbox.status"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}>
                    <i className="bi bi-stars" /> {IntlMessages("button.clear")}
                  </Button>
                  <Button color="primary" onClick={fnSave}>
                    <i className="iconsminds-save" /> {IntlMessages("button.save")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TransactionConcepts;