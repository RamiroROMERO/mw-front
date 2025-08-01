import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Button } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { SimpleSelect } from '@/components/simpleSelect';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { RadioGroup } from '@/components/radioGroup';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { useForm } from '@/hooks';
import ReactTable from "@/components/reactTable";
import TableButton from "@/components/tableButtons";
import notification from '@/containers/ui/Notifications';
import Confirmation from '@/containers/ui/confirmationMsg';

const ItemsCodes = (props) => {
  const { setLoading } = props;
  const [listComp, setListComp] = useState([]);
  const [listTaxDoc, setListTaxDoc] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const itemsCodesValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"],
    title: [(val) => val !== "", "msg.required.input.title"],
    companyId: [(val) => validInt(val) > 0, "msg.required.input.company"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    code: '',
    name: '',
    type: 0,
    title: '',
    codeInt: '',
    useTaxDocument: false,
    companyId: 0,
    taxDocumentId: 0,
    isReportBank: false,
    useBill: 0,
    useAcc: 0,
    useFixass: 0,
    useInv: 0,
    useTax: 0,
    useBank: 0,
    bankCheck: false,
    bankTransfer: false,
    bankDepo: false,
    bankNcd: false,
    bankExpense: false,
    status: true
  }, itemsCodesValid);

  const { id, code, name, type, title, codeInt, useTaxDocument, companyId, taxDocumentId, isReportBank, useBill, useAcc,
    useFixass, useInv, useTax, useBank, bankCheck, bankTransfer, bankDepo, bankNcd, bankExpense, status } = formState;

  const { codeValid, nameValid, titleValid, companyIdValid } = formValidation;

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.itemsCodes.table.title"),
    columns: [
      { text: IntlMessages("page.itemsCodes.table.code"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.itemsCodes.table.name"), dataField: "name", headerStyle: { 'width': '35%' } },
      {
        text: IntlMessages("page.itemsCodes.table.correlative"), dataField: "codeInt", headerStyle: { 'width': '25%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '25%' } }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: 'button.edit',
      onClick: fnEditItem,
      title: IntlMessages('button.edit')
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnDeleteItem,
      showInMenu: true,
      title: IntlMessages('button.delete')
    }],
    options: {
      enabledActionButtons: true
    }
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/documents', (resp) => {
      const { data } = resp;
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

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`admin/documents/${currentItem.id}`, (resp) => {
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

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if ((useBill === 0 || useBill === false) && (useInv === 0 || useInv === false) && (useAcc === 0 || useAcc === false)
      && (useTax === 0 || useTax === false) && (useFixass === 0 || useFixass === false) && (useBank === 0 || useBank === false)) {
      notification('warning', 'msg.required.check.useArea', 'alert.warning.title');
      return;
    }

    const data = {
      code,
      name,
      title,
      codeInt,
      companyId,
      isReportBank,
      type,
      useTaxDocument,
      taxDocumentId,
      useBill,
      useInv,
      useAcc,
      useTax,
      useFixass,
      useBank,
      bankCheck,
      bankTransfer,
      bankDepo,
      bankNcd,
      bankExpense,
      status
    }
    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/documents/${id}`, data, (resp) => {
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
      request.POST('admin/documents', data, (resp) => {
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

  useEffect(() => {
    setLoading(true);
    request.GET('admin/companies', (resp) => {
      const companies = resp.data;
      setListComp(companies)
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/taxDocuments', (resp) => {
      const setTaxDoc = resp.data;
      setListTaxDoc(setTaxDoc)
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="5">
          <Card className='mb-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={code}
                    name="code"
                    onChange={onInputChange}
                    type="text"
                    label="page.itemsCodes.input.code"
                    invalid={sendForm && !!codeValid}
                    feedbackText={sendForm && codeValid || null}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.itemsCodes.input.name"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && nameValid || null}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={title}
                    name="title"
                    onChange={onInputChange}
                    type="text"
                    label="page.itemsCodes.input.title"
                    invalid={sendForm && !!titleValid}
                    feedbackText={sendForm && titleValid || null}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <InputField
                    value={codeInt}
                    name="codeInt"
                    onChange={onInputChange}
                    type="text"
                    label="page.itemsCodes.input.correlative"
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <SimpleSelect
                    value={companyId}
                    name="companyId"
                    onChange={onInputChange}
                    label="page.itemsCodes.select.companyId"
                    options={listComp}
                    invalid={sendForm && !!companyIdValid}
                    feedbackText={sendForm && companyIdValid || null}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" lg="12">
                  <SimpleSelect
                    value={taxDocumentId}
                    name="taxDocumentId"
                    onChange={onInputChange}
                    label="page.itemsCodes.select.taxDocumentId"
                    options={listTaxDoc}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" xs="5">
                  <RadioGroup
                    label="page.itemsCodes.title.type"
                    name="type"
                    value={type}
                    onChange={onInputChange}
                    options={
                      [
                        { id: 1, label: "page.ItemsCodes.radio.type.must" },
                        { id: 2, label: "page.ItemsCodes.radio.type.have" }
                      ]
                    }
                  />
                </Colxx>
                <Colxx xxs="12" xs="7">
                  <Row>
                    <Colxx xxs="12" md="6" lg="12">
                      <Checkbox
                        onChange={onInputChange}
                        name="useTaxDocument"
                        value={useTaxDocument}
                        label="page.itemsCodes.check.useTaxDocument"
                      />
                    </Colxx>
                    <Colxx xxs="12" md="6" lg="12">
                      <Checkbox
                        onChange={onInputChange}
                        name="isReportBank"
                        value={isReportBank}
                        label="page.itemsCodes.check.reconciliationBank"
                      />
                    </Colxx>
                    <Colxx xxs="12" md="6" lg="12">
                      <Checkbox
                        onChange={onInputChange}
                        name="status"
                        value={status}
                        label="check.status"
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <ContainerWithLabel label="page.itemsCodes.title.areasofUse">
                    <Row>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useBill"
                          value={useBill}
                          label="page.itemsCodes.check.billing"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useAcc"
                          value={useAcc}
                          label="page.itemsCodes.check.accounting"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useFixass"
                          value={useFixass}
                          label="page.itemsCodes.check.fixedAssets"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useInv"
                          value={useInv}
                          label="page.itemsCodes.check.inventories"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useTax"
                          value={useTax}
                          label="page.itemsCodes.check.taxes"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="useBank"
                          value={useBank}
                          label="page.itemsCodes.check.banks"
                        />
                      </Colxx>
                    </Row>
                  </ContainerWithLabel>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <ContainerWithLabel label="page.itemsCodes.title.banks">
                    <Row>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="bankCheck"
                          value={bankCheck}
                          label="page.itemsCodes.check.checks"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="bankTransfer"
                          value={bankTransfer}
                          label="page.itemsCodes.check.transfers"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="bankDepo"
                          value={bankDepo}
                          label="page.itemsCodes.check.deposits"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="bankNcd"
                          value={bankNcd}
                          label="page.itemsCodes.check.debitNotes"
                        />
                      </Colxx>
                      <Colxx xxs="6" xs="6" sm="4" md="4" lg="6" xl="4">
                        <Checkbox
                          onChange={onInputChange}
                          name="bankExpense"
                          value={bankExpense}
                          label="page.itemsCodes.check.expenses"
                        />
                      </Colxx>
                    </Row>
                  </ContainerWithLabel>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                  <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="7">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );

}
export default ItemsCodes;