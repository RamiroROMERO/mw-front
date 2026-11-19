import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from "reactstrap";
import classnames from "classnames";
import { Colxx } from "@Components/common/CustomBootstrap";
import { formatNumber, IntlMessages } from "@Helpers/Utils";
import { useForm } from "@Hooks";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { Checkbox } from "@Components/checkbox";
import { InputField } from "@Components/inputFields";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import notification from "@Containers/ui/Notifications";
import DateCalendar from "@Components/dateCalendar";
import ReactTable from "@Components/reactTable";
import TableButton from "@Components/tableButtons";
import Confirmation from "@Containers/ui/confirmationMsg";
import Modal from "@Components/modal";
import ModalPrintCashClose from "./ModalPrintCashClose";
import {
  CASH_CLOSE_PATH, validateCashClose, buildPayload, buildPreviewQuery, isInitialEditable, differenceKind, canApply, canVoid, canDelete
} from "./posCashCloseRules";

const PREVIEW_DELAY_MS = 300;
const EMPTY = { id: 0, date: "", cashierId: 0, allCashiers: false, cashValue: "", initialValue: "", depositNumber: "", depositValue: "" };
const NO_FIGURES = { invoicesCount: 0, voidedCount: 0, total: 0, discount: 0, exempt: 0, taxed: 0, credit: 0, cashSalesType: 0, paymentMethods: [], paymentsTotal: 0, cashSales: 0, cancellationsCount: 0, cancellations: 0, advances: 0, entries: 0, exits: 0 };

const money = (value) => formatNumber(value || 0, "", 2);

// Cierre de caja del POS (SPEC v2-87-sr). Las cifras salen SIEMPRE del servidor (`GET /preview`): el navegador solo muestra y manda lo digitado. Aplicar cierra la apertura
// de la caja (la sesión del cajero termina) y anular, solo el supervisor, la reabre.
const ModalCashclose = (props) => {
  const { data, setOpen } = props;
  const { sessionId, dateInProcess, sessionCashierId, isSupervisor, printType, setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [rows, setRows] = useState([]);
  const [current, setCurrent] = useState(null);
  const [preview, setPreview] = useState({ figures: NO_FIGURES, expected: 0, difference: 0, initialValue: 0 });
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openMsgApply, setOpenMsgApply] = useState(false);
  const [openMsgVoid, setOpenMsgVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [sendVoidForm, setSendVoidForm] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const lastRequest = useRef(0);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...EMPTY, date: dateInProcess, cashierId: sessionCashierId }, {});
  const { id, date, cashierId, allCashiers, cashValue, initialValue, depositNumber, depositValue } = formState;
  const saved = id > 0;
  const editableInitial = !saved && isInitialEditable({ sessionDate: dateInProcess, sessionCashierId, date, cashierId, allCashiers });
  const errors = useMemo(() => (sendForm ? validateCashClose({ cashValue, depositValue, initialValue, editableInitial }) : {}), [sendForm, cashValue, depositValue, initialValue, editableInitial]);
  const editable = !saved || !current?.isApplied;
  const figures = preview.figures || NO_FIGURES;
  const kind = differenceKind(preview.difference);

  const fnPreview = () => {
    const requestId = lastRequest.current + 1;
    lastRequest.current = requestId;
    request.GET(buildUrl(`${CASH_CLOSE_PATH}/preview`, buildPreviewQuery({ sessionId, closeId: saved && current?.isApplied ? id : 0, date, cashierId, allCashiers, cashValue, initialValue: editableInitial ? initialValue : "" })), (resp) => {
      if (requestId === lastRequest.current) setPreview(resp.data);
    }, () => {}, false);
  };

  useEffect(() => {
    const timer = setTimeout(fnPreview, PREVIEW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [date, cashierId, allCashiers, cashValue, initialValue, id, current]);

  const fnGetCloses = () => {
    setLoading(true);
    request.GET(buildUrl(CASH_CLOSE_PATH, { sessionId, limit: 50 }), (resp) => {
      setRows(resp.data || []);
      setLoading(false);
    }, () => setLoading(false), false);
  };

  useEffect(() => { fnGetCloses(); }, []);

  const fnNew = () => {
    onResetForm();
    setCurrent(null);
    setSendForm(false);
    setActiveTab("1");
  };

  const fnView = (item) => {
    setLoading(true);
    request.GET(buildUrl(`${CASH_CLOSE_PATH}/${item.id}`, { sessionId }), (resp) => {
      const close = resp.data;
      setCurrent(close);
      setBulkForm({ ...EMPTY, id: close.id, date: close.date, cashierId: close.cashierId, allCashiers: close.allCashiers, cashValue: String(close.cashValue), initialValue: String(close.initialValue), depositNumber: close.depositNumber, depositValue: String(close.depositValue || "") });
      setPreview(close);
      setSendForm(false);
      setActiveTab("1");
      setLoading(false);
    }, () => setLoading(false), false);
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(validateCashClose({ cashValue, depositValue, initialValue, editableInitial })).length > 0) return;
    setLoading(true);
    const onSuccess = (resp) => {
      notification("success", "msg.save.record", "alert.success.title");
      setCurrent(resp.data);
      setBulkForm({ ...formState, id: resp.data.id });
      fnGetCloses();
      setLoading(false);
    };
    const body = buildPayload(formState, { isNew: !saved, editableInitial });
    if (saved) request.PUT(buildUrl(`${CASH_CLOSE_PATH}/${id}`, { sessionId }), body, onSuccess, () => setLoading(false));
    else request.POST(buildUrl(CASH_CLOSE_PATH, { sessionId }), body, onSuccess, () => setLoading(false));
  };

  const fnApply = () => {
    setLoading(true);
    request.POST(buildUrl(`${CASH_CLOSE_PATH}/${id}/apply`, { sessionId }), {}, () => {
      setOpenMsgApply(false);
      notification("success", "msg.success.applyCashClose", "alert.success.title");
      setLoading(false);
      setOpen(false);
    }, (err) => {
      setOpenMsgApply(false);
      notifyError(err, "msg.save.record.error");
      setLoading(false);
    }, false);
  };

  const fnVoid = () => {
    setSendVoidForm(true);
    if (voidReason.trim() === "") return;
    setLoading(true);
    request.DELETE(buildUrl(`${CASH_CLOSE_PATH}/${id}/void`, { sessionId, reason: voidReason.trim() }), () => {
      setOpenMsgVoid(false);
      notification("success", "msg.success.voidCashClose", "alert.success.title");
      fnGetCloses();
      fnNew();
      setLoading(false);
    }, (err) => {
      setOpenMsgVoid(false);
      notifyError(err, "msg.delete.record.error");
      setLoading(false);
    }, false);
  };

  const fnDelete = () => {
    setLoading(true);
    request.DELETE(buildUrl(`${CASH_CLOSE_PATH}/${id}`, { sessionId }), () => {
      fnGetCloses();
      fnNew();
      setLoading(false);
    }, (err) => {
      notifyError(err, "msg.delete.record.error");
      setLoading(false);
    }, false);
  };

  const listColumns = [
    { text: IntlMessages("page.pointSales.modal.cashClose.table.date"), dataField: "date", headerStyle: { width: "18%" } },
    { text: IntlMessages("page.pointSales.modal.cashClose.table.cashier"), dataField: "cashierName", headerStyle: { width: "32%" }, cell: ({ row }) => (row.original.allCashiers ? IntlMessages("page.pointSales.modal.cashClose.check.allCashiers") : row.original.cashierName) },
    { text: IntlMessages("page.pointSales.modal.cashClose.table.total"), dataField: "total", headerStyle: { width: "20%" }, align: "right", cell: ({ row }) => money(row.original.total) },
    {
      text: IntlMessages("page.pointSales.modal.cashClose.table.status"), dataField: "isApplied", headerStyle: { width: "18%" },
      cell: ({ row }) => <Badge color={row.original.isApplied ? "success" : "warning"}>{IntlMessages(row.original.isApplied ? "page.pointSales.modal.cashClose.status.applied" : "page.pointSales.modal.cashClose.status.pending")}</Badge>
    },
    { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: "12%" }, align: "right" }
  ];
  const listData = rows.map((item) => ({ ...item, options: <TableButton color="primary" icon="eye" fnOnClick={() => fnView(item)} /> }));

  const printData = { id, sessionId, date, cashierId, allCashiers, cashValue, isSupervisor, printType, setLoading };
  const propsToModalPrint = { ModalContent: ModalPrintCashClose, title: "page.pointSales.modal.printCashClose.title", open: openModalPrint, setOpen: setOpenModalPrint, maxWidth: "md", data: printData };
  const propsToMsgApply = { open: openMsgApply, setOpen: setOpenMsgApply, fnOnOk: fnApply, title: "msg.question.applyCashClose.title" };
  const propsToMsgVoid = { open: openMsgVoid, setOpen: setOpenMsgVoid, fnOnOk: fnVoid, title: "msg.question.cancel.document.title" };
  const invalid = (name) => !!errors[name];
  const line = (label, value, sign = "") => (
    <tr><td>{IntlMessages(label)}</td><td className="text-end">{sign}{money(value)}</td></tr>
  );

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ms-0 mb-3">
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "1", "nav-link": true })} onClick={() => setActiveTab("1")}>
              {IntlMessages("page.pointSales.modal.cashClose.title.currentClose")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "2", "nav-link": true })} onClick={() => setActiveTab("2")}>
              {IntlMessages("page.pointSales.modal.cashClose.title.performedClose")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNew}><i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}</Button>
                <Button color="primary" disabled={!editable} onClick={fnSave}><i className="iconsminds-save" />{IntlMessages("button.save")}</Button>
                <Button color="success" disabled={!canApply(current)} onClick={() => setOpenMsgApply(true)}><i className="bi bi-check2-circle" />{IntlMessages("button.applyCashClose")}</Button>
                <Button color="warning" disabled={!canVoid(current, isSupervisor)} onClick={() => { setVoidReason(""); setSendVoidForm(false); setOpenMsgVoid(true); }}><i className="bi bi-x-circle" />{IntlMessages("button.cancel2")}</Button>
                <Button color="danger" disabled={!canDelete(current)} onClick={fnDelete}><i className="bi bi-trash" />{IntlMessages("button.delete")}</Button>
                <Button color="info" onClick={() => setOpenModalPrint(true)}><i className="iconsminds-printer" />{IntlMessages("button.print")}</Button>
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx xxs="12" md="5">
                <DateCalendar value={date} name="date" onChange={onInputChange} label="page.pointSales.modal.cashClose.input.dateClosing" maxDate={new Date()} disabled={saved} />
                {isSupervisor && (
                  <Checkbox name="allCashiers" label="page.pointSales.modal.cashClose.check.allCashiers" checked={Boolean(allCashiers)} onChange={(e) => onInputChange({ target: { name: "allCashiers", value: e.target.checked } })} disabled={saved} />
                )}
                <InputField
                  value={initialValue === "" && !editableInitial ? String(preview.initialValue ?? 0) : initialValue} name="initialValue" onChange={onInputChange} type="number"
                  label="page.pointSales.modal.cashClose.input.initValue" disabled={!editableInitial} invalid={invalid("initialValue")} feedbackText={errors.initialValue || null}
                />
                <InputField
                  value={cashValue} name="cashValue" onChange={onInputChange} type="number" label="page.pointSales.modal.cashClose.input.cashValue" disabled={!editable} bold
                  invalid={invalid("cashValue")} feedbackText={errors.cashValue || null}
                />
                <ContainerWithLabel label="page.pointSales.modal.cashClose.input.depositValue">
                  <InputField value={depositNumber} name="depositNumber" onChange={onInputChange} type="text" label="page.pointSales.modal.cashClose.input.depositNumber" maxLength={50} disabled={!editable} />
                  <InputField value={depositValue} name="depositValue" onChange={onInputChange} type="number" label="page.pointSales.modal.cashClose.input.depositValue" disabled={!editable} invalid={invalid("depositValue")} feedbackText={errors.depositValue || null} />
                </ContainerWithLabel>
              </Colxx>
              <Colxx xxs="12" md="7">
                <ContainerWithLabel label="page.pointSales.modal.cashClose.summary.title">
                  <Table size="sm" borderless>
                    <tbody>
                      <tr><td>{IntlMessages("page.pointSales.modal.cashClose.label.invoices")}</td><td className="text-end">{figures.invoicesCount} ({figures.voidedCount} {IntlMessages("page.pointSales.modal.cashClose.label.voided")})</td></tr>
                      {line("page.pointSales.modal.cashClose.input.totalSale", figures.total)}
                      {line("page.pointSales.modal.cashClose.input.cashSales", figures.cashSalesType)}
                      {line("page.pointSales.modal.cashClose.input.creditSales", figures.credit)}
                      {line("page.pointSales.modal.cashClose.input.totalDiscounts", figures.discount)}
                      {line("page.pointSales.modal.cashClose.input.totalExempt", figures.exempt)}
                      {line("page.pointSales.modal.cashClose.input.totalTaxed", figures.taxed)}
                      {line("page.pointSales.modal.cashClose.input.invoiced", figures.cashSales, "+ ")}
                      {line("page.pointSales.modal.cashClose.input.cancellations", figures.cancellations, "+ ")}
                      {line("page.pointSales.modal.cashClose.input.entries", figures.entries, "+ ")}
                      {line("page.pointSales.modal.cashClose.input.expenses", figures.exits, "- ")}
                      {line("page.pointSales.modal.cashClose.input.totalInCash", preview.expected)}
                      <tr>
                        <td><strong>{IntlMessages("page.pointSales.modal.cashClose.input.missingExcess")}</strong></td>
                        <td className={classnames("text-end", { "text-danger": kind !== "exact" })}><strong>{money(preview.difference)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </ContainerWithLabel>
                <ContainerWithLabel label="page.pointSales.modal.cashClose.tableDetail.title">
                  <Table size="sm">
                    <tbody>
                      {figures.paymentMethods.map((method) => (
                        <tr key={method.id}><td>{method.description}</td><td className="text-end">{money(method.total)}</td></tr>
                      ))}
                      <tr><td><strong>{IntlMessages("page.pointSales.modal.cashClose.table.total")}</strong></td><td className="text-end"><strong>{money(figures.paymentsTotal)}</strong></td></tr>
                    </tbody>
                  </Table>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Colxx xxs="12">
                <ReactTable title="" columns={listColumns} data={listData} actions={[]} />
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
              invalid={sendVoidForm && voidReason.trim() === ""} feedbackText={sendVoidForm && voidReason.trim() === "" ? "msg.required.input.voidReason" : null}
            />
          </Colxx>
        </Row>
      )}
      <Modal {...propsToModalPrint} />
      <Confirmation {...propsToMsgApply} />
      <Confirmation {...propsToMsgVoid} />
    </>
  );
};

export default ModalCashclose;
