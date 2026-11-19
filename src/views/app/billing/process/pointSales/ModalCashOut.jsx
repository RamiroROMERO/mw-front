import { useEffect, useMemo, useState } from "react";
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { Colxx } from "@Components/common/CustomBootstrap";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import { SimpleSelect } from "@Components/simpleSelect";
import { RadioGroup } from "@Components/radioGroup";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { printDocument } from "@Helpers/printDocument";
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { useForm } from "@Hooks";
import { InputField } from "@Components/inputFields";
import TableButton from "@Components/tableButtons";
import ReactTable from "@Components/reactTable";
import DateCalendar from "@Components/dateCalendar";
import Confirmation from "@Containers/ui/confirmationMsg";
import notification from "@Containers/ui/Notifications";
import {
  CASH_MOVEMENT_PATH, MOVEMENT_IN, MOVEMENT_OUT, typesFor, needsAccount, validateMovement, buildPayload, canEdit, canVoid, buildListQuery
} from "./cashMovementRules";

const EMPTY = { id: 0, movementType: MOVEMENT_OUT, documentCode: "", date: "", beneficDNI: "", beneficName: "", description: "", typeId: 0, value: "", outCtaCode: "" };

// Entradas y salidas de efectivo del POS (SPEC v2-86-sr). Todo va con la sesión de caja: la caja, el cajero y la empresa los pone el back.
const ModalCashOut = (props) => {
  const { data, setOpen } = props;
  const { sessionId, dateInProcess, listLedgerAccount = [], setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [settings, setSettings] = useState({ documents: [], types: [], canVoid: false, seesAll: false });
  const [rows, setRows] = useState([]);
  const [current, setCurrent] = useState(null);
  const [openMsgVoid, setOpenMsgVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [sendVoidForm, setSendVoidForm] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...EMPTY, date: dateInProcess }, {});
  const { id, movementType, documentCode, date, beneficDNI, beneficName, description, typeId, value, outCtaCode } = formState;

  const errors = useMemo(() => (sendForm ? validateMovement(formState, { types: settings.types }) : {}), [sendForm, formState, settings.types]);
  const typeOptions = useMemo(() => typesFor(settings.types, movementType), [settings.types, movementType]);
  const askAccount = needsAccount(settings.types, typeId);
  const editable = id === 0 || canEdit(current);

  const fnGetCashOut = (showAll = false) => {
    setLoading(true);
    request.GET(buildUrl(CASH_MOVEMENT_PATH, buildListQuery({ sessionId, all: showAll, date: showAll ? null : dateInProcess })), (resp) => {
      setRows(resp.data || []);
      setLoading(false);
    }, () => setLoading(false), false);
  };

  const fnLoadSettings = () => {
    request.GET(buildUrl(`${CASH_MOVEMENT_PATH}/settings`, { sessionId }), (resp) => {
      const info = resp.data;
      setSettings(info);
      if (info.documents.length === 1) onInputChange({ target: { name: "documentCode", value: info.documents[0].code } });
    }, () => {}, false);
  };

  useEffect(() => {
    fnLoadSettings();
    fnGetCashOut();
  }, []);

  const fnNew = () => {
    onResetForm();
    setCurrent(null);
    setSendForm(false);
    setActiveTab("1");
  };

  const fnView = (item) => {
    setLoading(true);
    request.GET(buildUrl(`${CASH_MOVEMENT_PATH}/${item.id}`, { sessionId }), (resp) => {
      const full = resp.data;
      setCurrent(full);
      setBulkForm({ ...EMPTY, ...full, value: String(full.value), outCtaCode: needsAccount(settings.types, full.typeId) ? full.outCtaCode : "" });
      setSendForm(false);
      setActiveTab("1");
      setLoading(false);
    }, () => setLoading(false), false);
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(validateMovement(formState, { types: settings.types })).length > 0) return;
    setLoading(true);
    const isNew = id === 0;
    const onSuccess = () => {
      onResetForm();
      setCurrent(null);
      setSendForm(false);
      setActiveTab("2");
      fnGetCashOut();
      setLoading(false);
    };
    const onError = () => setLoading(false);
    const url = buildUrl(isNew ? CASH_MOVEMENT_PATH : `${CASH_MOVEMENT_PATH}/${id}`, { sessionId });
    if (isNew) request.POST(url, buildPayload(formState), onSuccess, onError);
    else request.PUT(url, buildPayload(formState, { isNew: false }), onSuccess, onError);
  };

  const fnPrint = () => printDocument({ path: CASH_MOVEMENT_PATH, id, fileName: "Recibo de Efectivo.pdf", query: { sessionId }, setLoading });

  const fnAskVoid = (movementId) => {
    if (movementId > 0) {
      setVoidReason("");
      setSendVoidForm(false);
      setOpenMsgVoid(true);
      onInputChange({ target: { name: "id", value: movementId } });
    }
  };

  // Reversión contable (contra-asiento): el recibo se conserva, se marca anulado y se revierte la partida.
  const fnOkVoid = () => {
    setSendVoidForm(true);
    if (voidReason.trim() === "") return;
    setLoading(true);
    request.DELETE(buildUrl(`${CASH_MOVEMENT_PATH}/${id}`, { sessionId, reason: voidReason.trim() }), () => {
      fnGetCashOut();
      setOpenMsgVoid(false);
      fnNew();
      notification("success", "msg.success.voidCashMovement", "alert.success.title");
      setLoading(false);
    }, (err) => {
      notifyError(err, "msg.delete.record.error");
      setOpenMsgVoid(false);
      setLoading(false);
    }, false);
  };

  const columns = [
    { text: IntlMessages("page.pointSales.modal.cashOut.table.no"), dataField: "documentId", headerStyle: { width: "12%" }, cell: ({ row }) => `${row.original.documentCode}-${row.original.documentId}` },
    { text: IntlMessages("page.pointSales.modal.cashOut.table.beneficiary"), dataField: "beneficName", headerStyle: { width: "26%" } },
    { text: IntlMessages("page.pointSales.modal.cashOut.table.value"), dataField: "value", headerStyle: { width: "13%" }, align: "right", cell: ({ row }) => formatNumber(row.original.value, "", 2) },
    {
      text: IntlMessages("page.pointSales.modal.cashOut.table.type"), dataField: "movementType", headerStyle: { width: "12%" },
      cell: ({ row }) => IntlMessages(row.original.movementType === MOVEMENT_IN ? "page.pointSales.modal.cashOut.radio.in" : "page.pointSales.modal.cashOut.radio.out")
    },
    { text: IntlMessages("page.pointSales.modal.cashOut.table.date"), dataField: "date", headerStyle: { width: "13%" } },
    { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: "12%" }, align: "right" }
  ];
  const tableData = rows.map((item) => ({
    ...item,
    options: (
      <>
        <TableButton color="primary" icon="eye" fnOnClick={() => fnView(item)} />
        {canVoid(item, settings.canVoid) && <TableButton color="danger" icon="bi bi-x-circle" fnOnClick={() => fnAskVoid(item.id)} />}
      </>
    )
  }));

  const propsToMsgVoid = { open: openMsgVoid, setOpen: setOpenMsgVoid, fnOnOk: fnOkVoid, title: "msg.question.cancel.document.title", fnOnNo: fnNew };
  const invalid = (name) => sendForm && !!errors[name];
  const feedback = (name) => (sendForm && errors[name] ? errors[name] : null);

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ms-0 mb-2">
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "1", "nav-link": true })} onClick={() => setActiveTab("1")}>
              {IntlMessages("page.pointSales.modal.cashOut.title.detail")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "2", "nav-link": true })} onClick={() => setActiveTab("2")}>
              {IntlMessages("page.pointSales.modal.cashOut.title.expenses")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row className="mb-3">
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNew}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="primary" disabled={!editable} onClick={fnSave}>
                  <i className="iconsminds-save" />{IntlMessages("button.save")}
                </Button>
                <Button color="info" disabled={id === 0} onClick={fnPrint}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
                <Button color="warning" disabled={id === 0 || !canVoid(current, settings.canVoid)} onClick={() => fnAskVoid(id)}>
                  <i className="bi bi-x-circle" />{IntlMessages("button.cancel2")}
                </Button>
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.pointSales.modal.cashOut.title.detail">
                  <Row>
                    <Colxx xxs="12" md="4">
                      <RadioGroup
                        name="movementType"
                        value={movementType}
                        onChange={(e) => { onInputChange(e); onInputChange({ target: { name: "typeId", value: 0 } }); }}
                        display="flex"
                        disabled={id > 0}
                        options={[
                          { id: MOVEMENT_IN, label: "page.pointSales.modal.cashOut.radio.in" },
                          { id: MOVEMENT_OUT, label: "page.pointSales.modal.cashOut.radio.out" }
                        ]}
                      />
                    </Colxx>
                    <Colxx xxs="12" md="4">
                      <SimpleSelect
                        name="documentCode"
                        label="page.pointSales.modal.cashOut.select.document"
                        value={documentCode || "0"}
                        onChange={(e) => onInputChange({ target: { name: "documentCode", value: e.target.value === "0" ? "" : e.target.value } })}
                        options={settings.documents}
                        getOptionValue={(item) => item.code}
                        getOptionLabel={(item) => `${item.code} - ${item.name}`}
                        disabled={id > 0}
                        invalid={invalid("documentCode")}
                        feedbackText={feedback("documentCode")}
                      />
                    </Colxx>
                    <Colxx xxs="12" md="4">
                      <DateCalendar value={date} name="date" onChange={onInputChange} label="page.pointSales.modal.cashOut.input.date" maxDate={new Date()} disabled={!editable} />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <ContainerWithLabel label="page.pointSales.modal.cashOut.label.beneficiary">
                        <Row>
                          <Colxx xxs="12" sm="6" md="4">
                            <InputField value={beneficDNI} name="beneficDNI" onChange={onInputChange} type="text" label="page.pointSales.modal.cashOut.input.rtn" maxLength={20} disabled={!editable} />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="8">
                            <InputField
                              value={beneficName} name="beneficName" onChange={onInputChange} type="text" label="page.pointSales.modal.cashOut.input.name" maxLength={100}
                              disabled={!editable} invalid={invalid("beneficName")} feedbackText={feedback("beneficName")}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <InputField
                        value={description} name="description" onChange={onInputChange} type="textarea" label="page.pointSales.modal.cashOut.input.description" maxLength={200}
                        disabled={!editable} invalid={invalid("description")} feedbackText={feedback("description")}
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
                        options={typeOptions}
                        disabled={!editable}
                        invalid={invalid("typeId")}
                        feedbackText={feedback("typeId")}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" md="4">
                      <InputField
                        value={value} name="value" onChange={onInputChange} type="number" label="page.pointSales.modal.cashOut.input.value"
                        disabled={!editable} invalid={invalid("value")} feedbackText={feedback("value")} bold
                      />
                    </Colxx>
                    {askAccount && (
                      <Colxx xxs="12" sm="12" md="4">
                        <SimpleSelect
                          name="outCtaCode"
                          label="page.pointSales.modal.cashOut.select.account"
                          value={outCtaCode || "0"}
                          onChange={(e) => onInputChange({ target: { name: "outCtaCode", value: e.target.value === "0" ? "" : e.target.value } })}
                          options={listLedgerAccount}
                          getOptionValue={(item) => item.value}
                          getOptionLabel={(item) => item.label}
                          disabled={!editable}
                          invalid={invalid("outCtaCode")}
                          feedbackText={feedback("outCtaCode")}
                        />
                      </Colxx>
                    )}
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
                {settings.seesAll && (
                  <Button color="secondary" onClick={() => fnGetCashOut(true)}>
                    <i className="bi bi-list-ul" />{IntlMessages("button.viewAll")}
                  </Button>
                )}
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ReactTable title={IntlMessages("page.pointSales.modal.cashOut.title.expenses")} columns={columns} data={tableData} actions={[]} />
              </Colxx>
            </Row>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages("button.exit")}`}
        </Button>
      </ModalFooter>
      {openMsgVoid && (
        <Row>
          <Colxx xxs="12">
            <InputField
              value={voidReason} name="voidReason" onChange={(e) => setVoidReason(e.target.value)} type="textarea" label="page.pointSales.modal.voidCashMovement.input.reason" maxLength={200}
              invalid={sendVoidForm && voidReason.trim() === ""}
              feedbackText={sendVoidForm && voidReason.trim() === "" ? "msg.required.input.voidReason" : null}
            />
          </Colxx>
        </Row>
      )}
      <Confirmation {...propsToMsgVoid} />
    </>
  );
};

export default ModalCashOut;
