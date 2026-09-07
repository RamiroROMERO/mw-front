import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { Colxx } from "@Components/common/CustomBootstrap";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import { SimpleSelect } from "@Components/simpleSelect";
import { RadioGroup } from "@Components/radioGroup";
import { request, buildUrl } from "@Helpers/core";
import { IntlMessages, formatNumber, validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks";
import { InputField } from "@Components/inputFields";
import TableButton from "@Components/tableButtons";
import ReactTable from "@Components/reactTable";
import DateCalendar from "@Components/dateCalendar";
import Confirmation from "@Containers/ui/confirmationMsg";
import notification from "@Containers/ui/Notifications";

const MOVEMENT_TYPE_IN = 1; // Entrada
const MOVEMENT_TYPE_OUT = 2; // Salida

const ModalCashOut = (props) => {
  const { data, setOpen } = props;
  const { dateInProcess, cashId, cashierId, listTypeExpenses, setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [openMsgCancelCashOut, setOpenMsgCancelCashOut] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [sendVoidForm, setSendVoidForm] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const cashOutValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    beneficName: [(val) => val !== "", "msg.required.input.name"],
    value: [(val) => validInt(val) > 0, "msg.required.input.value"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    movementType: MOVEMENT_TYPE_OUT,
    date: dateInProcess,
    beneficDNI: "",
    beneficName: "",
    description: "",
    typeId: 0,
    value: 0
  }, cashOutValid);

  const { id, movementType, date, beneficDNI, beneficName, description, typeId, value } = formState;

  const { dateValid, beneficNameValid, valueValid } = formValidation;

  const [table, setTable] = useState({
    title: IntlMessages("page.pointSales.modal.cashOut.title.expenses"),
    columns: [
      { text: IntlMessages("page.pointSales.modal.cashOut.table.no"), dataField: "no", headerStyle: { 'width': '8%' } },
      { text: IntlMessages("page.pointSales.modal.cashOut.table.beneficiary"), dataField: "beneficName", headerStyle: { 'width': '27%' } },
      {
        text: IntlMessages("page.pointSales.modal.cashOut.table.value"),
        dataField: "value",
        headerStyle: { 'width': '15%' },
        align: 'right',
        formatter: (cell, row) => {
          return (formatNumber(cell, '', 2));
        }
      },
      {
        text: IntlMessages("page.pointSales.modal.cashOut.table.type"),
        dataField: "movementType",
        headerStyle: { 'width': '13%' },
        // Este ReactTable usa la API de tanstack-table (`cell`), no `formatter` (prop
        // muerta de una versión anterior — ver "Valor" arriba, nunca se leyó en ningún
        // lado). IntlMessages usa el hook useIntl(): acá es seguro porque `cell` lo
        // ejecuta la tabla durante su propio render, no en el callback async de
        // fnGetCashOut (eso rompía las reglas de hooks y dejaba la tabla vacía).
        cell: ({ row }) => IntlMessages(validInt(row.original.movementType) === MOVEMENT_TYPE_IN ? "page.pointSales.modal.cashOut.radio.in" : "page.pointSales.modal.cashOut.radio.out")
      },
      { text: IntlMessages("page.pointSales.modal.cashOut.table.date"), dataField: "date", headerStyle: { 'width': '13%' } },
      { text: IntlMessages("page.pointSales.modal.cashOut.table.accountingNo"), dataField: "pdaNumber", headerStyle: { 'width': '12%' }, align: 'right' },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "12%" }, align: "right" }
    ],
    data: [],
    actions: []
  });

  const fnNewcashOut = () => {
    onResetForm();
    setSendForm(false);
    setActiveTab("1");
  }

  const fnPrintCashOut = () => {

  }

  const fnViewCashout = (item) => {
    setBulkForm(item);
    setActiveTab("1");
  }

  const fnCancelCashOut = (idCashOut) => {
    if (idCashOut > 0) {
      setVoidReason("");
      setSendVoidForm(false);
      setOpenMsgCancelCashOut(true);
      onInputChange({ target: { name: "id", value: idCashOut } });
    }
  }

  const fnGetCashOut = (showAll = false) => {
    const queryParams = showAll
      ? { cashierId, cashId, status: 1, closedId: 0 }
      : { date, cashierId, cashId, status: 1, closedId: 0 };
    setLoading(true);
    request.GET(buildUrl('billing/process/invoiceExpenses', queryParams), (resp) => {
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

  // Reversión contable (contra-asiento), no un borrado directo como el legacy — misma regla
  // ya aplicada a "Anular Documento" del POS: el documento se conserva, se marca anulado y se
  // revierte la partida contable dentro de una transacción.
  const fnOkCancelCashOut = () => {
    setSendVoidForm(true);
    if (voidReason.trim() === "") {
      return;
    }
    setLoading(true);
    request.DELETE(buildUrl(`billing/process/pointSales/cashMovement/${id}`, { reason: voidReason.trim() }), () => {
      fnGetCashOut();
      setOpenMsgCancelCashOut(false);
      onResetForm();
      notification('success', 'msg.success.voidCashMovement', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      setOpenMsgCancelCashOut(false);
      notification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  const fnSaveCashOut = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      movementType,
      date,
      cashId,
      cashierId,
      typeId,
      beneficDNI,
      beneficName,
      description,
      value
    }
    if (id === 0) {
      setLoading(true);
      request.POST('billing/process/pointSales/cashMovement', newData, (resp) => {
        onResetForm();
        setSendForm(false);
        setActiveTab("2");
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
        <Nav tabs className="separator-tabs ms-0 mb-2">
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "1", "nav-link": true })}
              onClick={() => setActiveTab("1")}
            >
              {IntlMessages("page.pointSales.modal.cashOut.title.detail")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "2", "nav-link": true })}
              onClick={() => setActiveTab("2")}
            >
              {IntlMessages("page.pointSales.modal.cashOut.title.expenses")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row className="mb-3">
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNewcashOut}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="primary" disabled={id > 0} onClick={fnSaveCashOut}>
                  <i className="iconsminds-save" />{IntlMessages("button.save")}
                </Button>
                <Button color="info" disabled={id === 0} onClick={fnPrintCashOut}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
                <Button color="warning" disabled={id === 0} onClick={() => fnCancelCashOut(id)}>
                  <i className="bi bi-x-circle" />{IntlMessages("button.cancel2")}
                </Button>
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.pointSales.modal.cashOut.title.detail">
                  <Row>
                    <Colxx xxs="12" md="6">
                      <RadioGroup
                        name="movementType"
                        value={movementType}
                        onChange={onInputChange}
                        display="flex"
                        options={[
                          { id: MOVEMENT_TYPE_IN, label: "page.pointSales.modal.cashOut.radio.in" },
                          { id: MOVEMENT_TYPE_OUT, label: "page.pointSales.modal.cashOut.radio.out" }
                        ]}
                      />
                    </Colxx>
                    <Colxx xxs="12" md="6">
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
                          <Colxx xxs="12" sm="6" md="4">
                            <InputField
                              value={beneficDNI}
                              name="beneficDNI"
                              onChange={onInputChange}
                              type="text"
                              label="page.pointSales.modal.cashOut.input.rtn"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="8">
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
                    <Colxx xxs="12" sm="6" md="4">
                      <SimpleSelect
                        name="typeId"
                        label="page.pointSales.modal.cashOut.select.typeExpense"
                        value={typeId}
                        onChange={onInputChange}
                        options={listTypeExpenses}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" md="4">
                      <InputField
                        value={value}
                        name="value"
                        onChange={onInputChange}
                        type="number"
                        label="page.pointSales.modal.cashOut.input.value"
                        invalid={sendForm && !!valueValid}
                        feedbackText={sendForm && (valueValid || null)}
                        bold
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row className="mb-3">
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={() => fnGetCashOut(false)}>
                  <i className="bi bi-calendar-day" />{IntlMessages("button.today")}
                </Button>
                <Button color="secondary" onClick={() => fnGetCashOut(true)}>
                  <i className="bi bi-list-ul" />{IntlMessages("button.viewAll")}
                </Button>
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ReactTable {...table} />
              </Colxx>
            </Row>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      {openMsgCancelCashOut && (
        <Row>
          <Colxx xxs="12">
            <InputField
              value={voidReason}
              name="voidReason"
              onChange={(e) => setVoidReason(e.target.value)}
              type="textarea"
              label="page.pointSales.modal.voidCashMovement.input.reason"
              invalid={sendVoidForm && voidReason.trim() === ""}
              feedbackText={sendVoidForm && voidReason.trim() === "" ? "msg.required.input.voidReason" : null}
            />
          </Colxx>
        </Row>
      )}
      <Confirmation {...propsToMsgCancelCashOut} />
    </>
  )
}

export default ModalCashOut;