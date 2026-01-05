import React, { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from "@/components/common/CustomBootstrap";
import { ContainerWithLabel } from "@/components/containerWithLabel";
import { SimpleSelect } from "@/components/simpleSelect";
import { request } from "@/helpers/core";
import { IntlMessages, formatNumber, validInt } from "@/helpers/Utils";
import { useForm } from "@/hooks";
import { InputField } from "@/components/inputFields";
import TableButton from "@/components/tableButtons";
import ReactTable from "@/components/reactTable";
import DateCalendar from "@/components/dateCalendar";
import Confirmation from "@/containers/ui/confirmationMsg";

const ModalCashOut = (props) => {
  const { data, setOpen } = props;
  const { dateInProcess, cashId, cashierId, listTypeExpenses, setLoading } = data;
  const [openMsgCancelCashOut, setOpenMsgCancelCashOut] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const cashOutValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    beneficName: [(val) => val !== "", "msg.required.input.name"],
    value: [(val) => validInt(val) > 0, "msg.required.input.value"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: dateInProcess,
    beneficDNI: "",
    beneficName: "",
    description: "",
    typeId: 0,
    value: 0
  }, cashOutValid);

  const { id, date, beneficDNI, beneficName, description, typeId, value } = formState;

  const { dateValid, beneficNameValid, valueValid } = formValidation;

  const [table, setTable] = useState({
    title: IntlMessages("page.pointSales.modal.cashOut.title.expenses"),
    columns: [
      { text: IntlMessages("page.pointSales.modal.cashOut.table.no"), dataField: "no", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.pointSales.modal.cashOut.table.beneficiary"), dataField: "beneficName", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("page.pointSales.modal.cashOut.table.value"),
        dataField: "value",
        headerStyle: { 'width': '20%' },
        align: 'right',
        formatter: (cell, row) => {
          return (formatNumber(cell, '', 2));
        }
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "20%" }, align: "right" }
    ],
    data: [],
    actions: []
  });

  const fnNewcashOut = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnPrintCashOut = () => {

  }

  const fnViewCashout = (item) => {
    setBulkForm(item);
  }

  const fnCancelCashOut = (idCashOut) => {
    if (idCashOut > 0) {
      setOpenMsgCancelCashOut(true);
      onInputChange({ target: { name: "id", value: idCashOut } });
    }
  }

  const fnGetCashOut = () => {
    setLoading(true);
    request.GET(`billing/process/invoiceExpenses?date=${date}&cashierId=${cashierId}&cashId=${cashId}&status=1&closedId=0`, (resp) => {
      const cashOut = resp.data.map((item, idx) => {
        item.no = idx + 1
        item.options = <><TableButton color='primary' icon='eye' fnOnClick={() => fnViewCashout(item)} />
          <TableButton color='danger' icon='bi bi-x-circle' fnOnClick={() => fnCancelCashOut(item.id)} /></>
        return item;
      });
      const tableData = {
        ...table, data: cashOut
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnOkCancelCashOut = () => {
    const dataCancel = {
      status: 0
    }
    setLoading(true);
    request.PUT(`billing/process/invoiceExpenses/${id}`, dataCancel, (resp) => {
      fnGetCashOut();
      setOpenMsgCancelCashOut(false);
      onResetForm();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveCashOut = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      date,
      cashId,
      cashierId,
      typeId,
      beneficDNI,
      beneficName,
      description,
      value,
      status: 1
    }
    if (id === 0) {
      setLoading(true);
      request.POST('billing/process/invoiceExpenses', newData, (resp) => {
        fnGetCashOut();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetCashOut();
  }, []);

  const propsToMsgCancelCashOut = {
    open: openMsgCancelCashOut,
    setOpen: setOpenMsgCancelCashOut,
    fnOnOk: fnOkCancelCashOut,
    title: "msg.question.cancel.document.title",
    fnOnNo: onResetForm
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="5">
            <Row className="mb-3">
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="primary" onClick={fnNewcashOut}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="info" onClick={fnPrintCashOut}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.pointSales.modal.cashOut.title.detail">
                  <Row>
                    <Colxx xxs="12">
                      <DateCalendar
                        value={date}
                        name="date"
                        onChange={onInputChange}
                        label="page.pointSales.modal.cashOut.input.date"
                        invalid={sendForm && !!dateValid}
                        feedbackText={sendForm && (dateValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <ContainerWithLabel label="page.pointSales.modal.cashOut.label.beneficiary">
                        <Row>
                          <Colxx xxs="12" sm="6" md="12">
                            <InputField
                              value={beneficDNI}
                              name="beneficDNI"
                              onChange={onInputChange}
                              type="text"
                              label="page.pointSales.modal.cashOut.input.rtn"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="12">
                            <InputField
                              value={beneficName}
                              name="beneficName"
                              onChange={onInputChange}
                              type="text"
                              label="page.pointSales.modal.cashOut.input.name"
                              invalid={sendForm && !!beneficNameValid}
                              feedbackText={sendForm && (beneficNameValid || null)}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <InputField
                        value={description}
                        name="description"
                        onChange={onInputChange}
                        type="textarea"
                        label="page.pointSales.modal.cashOut.input.description"
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12" sm="6" md="12">
                      <SimpleSelect
                        name="typeId"
                        label="page.pointSales.modal.cashOut.select.typeExpense"
                        value={typeId}
                        onChange={onInputChange}
                        options={listTypeExpenses}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" md="12">
                      <InputField
                        value={value}
                        name="value"
                        onChange={onInputChange}
                        type="number"
                        label="page.pointSales.modal.cashOut.input.value"
                        invalid={sendForm && !!valueValid}
                        feedbackText={sendForm && (valueValid || null)}
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" md="7">
            <Row>
              <Colxx xxs="12">
                <ReactTable {...table} />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveCashOut}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgCancelCashOut} />
    </>
  )
}

export default ModalCashOut;