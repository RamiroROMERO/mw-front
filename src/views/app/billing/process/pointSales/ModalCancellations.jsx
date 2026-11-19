import { useEffect, useMemo, useState } from "react";
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { Colxx } from "@Components/common/CustomBootstrap";
import { useForm } from "@Hooks";
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import { SimpleSelect } from "@Components/simpleSelect";
import { InputField } from "@Components/inputFields";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { printDocument } from "@Helpers/printDocument";
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import DateCalendar from "@Components/dateCalendar";
import ReactTable from "@Components/reactTable";
import TableButtons from "@Components/tableButtons";
import Modal from "@Components/modal";
import Confirmation from "@Containers/ui/confirmationMsg";
import notification from "@Containers/ui/Notifications";
import ModalUnpaidBills from "./ModalUnpaidBills";
import { CANCELLATION_PATH, totals, formatCents, activePayments, validateReceipt, buildPayload, canVoid } from "./posCancellationRules";

const EMPTY = { id: 0, documentCode: "", customerId: 0, reference: "", date: "", description: "", differenceCtaCode: "" };

// Recibos de cancelación de clientes del POS (SPEC v2-89-sr). Todo va con la sesión de caja: la caja, el cajero y la empresa los pone el back. El pago baja el saldo real de
// la factura (se aplica donde lo lee la fórmula del saldo) y anular lo devuelve.
const ModalCancellations = (props) => {
  const { data, setOpen } = props;
  const { sessionId, dateInProcess, listCustomers, listLedgerAccount, setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [settings, setSettings] = useState({ documents: [], paymentMethods: [], canVoid: false, seesAll: false });
  const [methodValues, setMethodValues] = useState({});
  const [documents, setDocuments] = useState([]);
  const [rows, setRows] = useState([]);
  const [current, setCurrent] = useState(null);
  const [openModalUnpaidBills, setOpenModalUnpaidBills] = useState(false);
  const [openMsgVoid, setOpenMsgVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [sendVoidForm, setSendVoidForm] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...EMPTY, date: dateInProcess }, {});
  const { id, documentCode, customerId, reference, date, description, differenceCtaCode } = formState;
  const isNew = id === 0;

  const payments = useMemo(() => activePayments(settings.paymentMethods.map((method) => ({ id: method.id, value: methodValues[method.id] }))), [settings.paymentMethods, methodValues]);
  const sums = useMemo(() => totals({ documents, payments }), [documents, payments]);
  const errors = useMemo(() => (sendForm ? validateReceipt({ ...formState, documents, payments }) : {}), [sendForm, formState, documents, payments]);
  const invalid = (name) => !!errors[name];

  const fnGetCancellations = (showAll = false) => {
    setLoading(true);
    request.GET(buildUrl(CANCELLATION_PATH, { sessionId, all: showAll ? "true" : undefined, limit: 50 }), (resp) => {
      setRows(resp.data || []);
      setLoading(false);
    }, () => setLoading(false), false);
  };

  useEffect(() => {
    request.GET(buildUrl(`${CANCELLATION_PATH}/settings`, { sessionId }), (resp) => {
      setSettings(resp.data);
      if (resp.data.documents.length === 1) onInputChange({ target: { name: "documentCode", value: resp.data.documents[0].code } });
    }, () => {}, false);
    fnGetCancellations();
  }, []);

  const fnNew = () => {
    onResetForm();
    setDocuments([]);
    setMethodValues({});
    setCurrent(null);
    setSendForm(false);
    setActiveTab("1");
  };

  const fnAddDocuments = (newDocs) => {
    setDocuments((prev) => {
      const merged = [...prev];
      newDocs.forEach((doc) => {
        const index = merged.findIndex((item) => item.id === doc.id);
        if (index >= 0) merged[index] = doc;
        else merged.push(doc);
      });
      return merged;
    });
  };

  const fnRemoveDocument = (docId) => setDocuments((prev) => prev.filter((item) => item.id !== docId));

  const fnAddDocument = () => {
    if (!(Number(customerId) > 0)) {
      notification("warning", "page.pointSales.modal.cancellations.validation.customerRequired", "alert.warning.title");
      return;
    }
    setOpenModalUnpaidBills(true);
  };

  const fnView = (item) => {
    setLoading(true);
    request.GET(buildUrl(`${CANCELLATION_PATH}/${item.id}`, { sessionId }), (resp) => {
      const full = resp.data;
      setCurrent(full);
      setBulkForm({ ...EMPTY, id: full.id, documentCode: full.documentCode, customerId: full.customerId, reference: full.reference, date: String(full.date).slice(0, 10), description: full.description, differenceCtaCode: full.differenceCtaCode });
      setDocuments(full.documents.map((doc) => ({ id: doc.cxcId, documentCode: doc.documentCode, balance: doc.previousBalance, valuePaid: String(doc.valuePaid) })));
      setMethodValues(Object.fromEntries(full.payments.map((payment) => [payment.paymentTypeDetailId, String(payment.amount)])));
      setSendForm(false);
      setActiveTab("1");
      setLoading(false);
    }, () => setLoading(false), false);
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(validateReceipt({ ...formState, documents, payments })).length > 0) return;
    setLoading(true);
    request.POST(buildUrl(CANCELLATION_PATH, { sessionId }), buildPayload(formState, { documents, payments }), (resp) => {
      notification("success", "msg.save.record", "alert.success.title");
      fnNew();
      setActiveTab("2");
      fnGetCancellations();
      printDocument({ path: CANCELLATION_PATH, id: resp.data.id, fileName: "Recibo de Cancelacion.pdf", query: { sessionId, format: "letter" }, setLoading });
    }, () => setLoading(false));
  };

  const fnPrint = (format) => printDocument({ path: CANCELLATION_PATH, id, fileName: "Recibo de Cancelacion.pdf", query: { sessionId, format }, setLoading });

  const fnAskVoid = (receiptId) => {
    setVoidReason("");
    setSendVoidForm(false);
    setOpenMsgVoid(true);
    onInputChange({ target: { name: "id", value: receiptId } });
  };

  const fnOkVoid = () => {
    setSendVoidForm(true);
    if (voidReason.trim() === "") return;
    setLoading(true);
    request.DELETE(buildUrl(`${CANCELLATION_PATH}/${id}/void`, { sessionId, reason: voidReason.trim() }), () => {
      fnGetCancellations();
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

  const documentColumns = [
    { text: IntlMessages("page.pointSales.modal.cancellations.tableDocuments.document"), dataField: "documentCode", headerStyle: { width: "40%" } },
    { text: IntlMessages("page.pointSales.modal.cancellations.tableDocuments.balance"), dataField: "balance", headerStyle: { width: "25%" }, align: "right", cell: ({ row }) => formatNumber(row.original.balance, "", 2) },
    { text: IntlMessages("page.pointSales.modal.cancellations.tableDocuments.canceled"), dataField: "valuePaid", headerStyle: { width: "25%" }, align: "right", cell: ({ row }) => formatNumber(row.original.valuePaid, "", 2) },
    { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: "10%" }, align: "right" }
  ];
  const documentData = documents.map((doc) => ({ ...doc, options: isNew ? <TableButtons color="danger" icon="bi bi-trash" fnOnClick={() => fnRemoveDocument(doc.id)} /> : null }));

  const listColumns = [
    { text: IntlMessages("page.pointSales.modal.cancellations.table.date"), dataField: "date", headerStyle: { width: "14%" } },
    { text: IntlMessages("page.pointSales.modal.cancellations.table.number"), dataField: "documentId", headerStyle: { width: "16%" }, cell: ({ row }) => (row.original.hasDocument ? `${row.original.documentCode}-${row.original.documentId}` : IntlMessages("page.pointSales.modal.cancellations.noDocument")) },
    { text: IntlMessages("page.pointSales.modal.cancellations.table.customer"), dataField: "customerName", headerStyle: { width: "36%" } },
    { text: IntlMessages("page.pointSales.modal.cashOut.table.value"), dataField: "total", headerStyle: { width: "16%" }, align: "right", cell: ({ row }) => formatNumber(row.original.total, "", 2) },
    { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: "18%" }, align: "right" }
  ];
  const listData = rows.map((item) => ({
    ...item,
    options: (
      <>
        <TableButtons color="primary" icon="eye" fnOnClick={() => fnView(item)} />
        {canVoid(item, settings.canVoid) && <TableButtons color="danger" icon="bi bi-x-circle" fnOnClick={() => fnAskVoid(item.id)} />}
      </>
    )
  }));

  const propsToModalUnpaidBills = {
    ModalContent: ModalUnpaidBills,
    title: "page.pointSales.modal.unpaidBills.title",
    open: openModalUnpaidBills,
    setOpen: setOpenModalUnpaidBills,
    maxWidth: "lg",
    data: { setLoading, customerId, sessionId, fnAddDocuments }
  };
  const propsToMsgVoid = { open: openMsgVoid, setOpen: setOpenMsgVoid, fnOnOk: fnOkVoid, title: "msg.question.cancel.document.title", fnOnNo: fnNew };
  const differenceText = formatCents(Math.abs(sums.differenceCents));

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ms-0 mb-3">
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "1", "nav-link": true })} onClick={() => setActiveTab("1")}>
              {IntlMessages("page.pointSales.modal.cancellations.title.currentCancel")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={classnames({ active: activeTab === "2", "nav-link": true })} onClick={() => setActiveTab("2")}>
              {IntlMessages("page.pointSales.modal.cancellations.title.customerCancel")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNew}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="info" disabled={isNew} onClick={() => fnPrint("letter")}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
                <Button color="info" disabled={isNew} onClick={() => fnPrint("ticket")}>
                  <i className="iconsminds-printer" />{IntlMessages("page.pointSales.modal.cancellations.button.ticket")}
                </Button>
                <Button color="warning" disabled={isNew || !canVoid(current, settings.canVoid)} onClick={() => fnAskVoid(id)}>
                  <i className="bi bi-x-circle" />{IntlMessages("button.cancel2")}
                </Button>
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx xxs="12" md="6">
                <SimpleSelect
                  name="documentCode"
                  label="page.pointSales.modal.cancellations.select.documentCode"
                  value={documentCode || "0"}
                  onChange={(e) => onInputChange({ target: { name: "documentCode", value: e.target.value === "0" ? "" : e.target.value } })}
                  options={settings.documents}
                  getOptionValue={(item) => item.code}
                  getOptionLabel={(item) => `${item.code} - ${item.name}`}
                  disabled={!isNew}
                  invalid={invalid("documentCode")}
                  feedbackText={errors.documentCode || null}
                />
                <ContainerWithLabel label="page.invoicing.title.customer">
                  <SearchSelect
                    label="page.invoicing.select.customerId"
                    name="customerId"
                    inputValue={customerId}
                    onChange={(e) => { onInputChange(e); setDocuments([]); }}
                    options={listCustomers}
                    isDisabled={!isNew}
                    invalid={invalid("customerId")}
                    feedbackText={errors.customerId || null}
                  />
                  <InputField value={reference} name="reference" onChange={onInputChange} type="text" label="page.invoicing.input.reference" maxLength={150} disabled={!isNew} />
                </ContainerWithLabel>
                <ContainerWithLabel label="page.pointSales.modal.cancellations.title.detail">
                  <DateCalendar value={date} name="date" onChange={onInputChange} label="page.pointSales.modal.cancellations.input.date" maxDate={new Date()} disabled={!isNew} />
                  <InputField value={description} name="description" onChange={onInputChange} type="text" label="page.pointSales.modal.cancellations.input.description" disabled={!isNew} />
                </ContainerWithLabel>
                {isNew && (
                  <Row className="mb-2">
                    <Colxx xxs="12" align="right">
                      <Button color="primary" onClick={fnAddDocument}>
                        <i className="bi bi-plus" /> {IntlMessages("button.add")}
                      </Button>
                    </Colxx>
                  </Row>
                )}
                <ReactTable title={IntlMessages("page.pointSales.modal.cancellations.title.documents")} columns={documentColumns} data={documentData} actions={[]} />
                {errors.documents && <div className="text-danger small">{IntlMessages(errors.documents)}</div>}
              </Colxx>
              <Colxx xxs="12" md="6">
                <ContainerWithLabel label="page.pointSales.modal.cancellations.title.paymentMethods">
                  {settings.paymentMethods.map((method) => (
                    <InputField
                      key={method.id}
                      value={methodValues[method.id] ?? ""}
                      name={`method-${method.id}`}
                      onChange={(e) => setMethodValues((prev) => ({ ...prev, [method.id]: e.target.value }))}
                      type="number"
                      label={method.description}
                      disabled={!isNew}
                    />
                  ))}
                  {errors.payments && <div className="text-danger small">{IntlMessages(errors.payments)}</div>}
                </ContainerWithLabel>
                <ContainerWithLabel label="page.pointSales.modal.cancellations.differentialDetail">
                  <Row>
                    <Colxx xxs="12" md="4"><strong>{IntlMessages("page.pointSales.modal.cancellations.label.collected")}: {formatCents(sums.collectedCents)}</strong></Colxx>
                    <Colxx xxs="12" md="4"><strong>{IntlMessages("page.pointSales.modal.cancellations.label.applied")}: {formatCents(sums.appliedCents)}</strong></Colxx>
                    <Colxx xxs="12" md="4"><strong className={sums.differenceCents !== 0 ? "text-danger" : ""}>{IntlMessages("page.pointSales.modal.cancellations.input.difference")}: {sums.differenceCents < 0 ? "-" : ""}{differenceText}</strong></Colxx>
                  </Row>
                  {sums.differenceCents !== 0 && (
                    <SearchSelect
                      label="page.pointSales.modal.cancellations.select.ledgerAccount"
                      name="differenceCtaCode"
                      inputValue={differenceCtaCode}
                      options={listLedgerAccount}
                      onChange={onInputChange}
                      isDisabled={!isNew}
                      invalid={invalid("differenceCtaCode")}
                      feedbackText={errors.differenceCtaCode || null}
                    />
                  )}
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row className="mb-3">
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={() => fnGetCancellations(false)}>
                  <i className="bi bi-calendar-day" />{IntlMessages("button.today")}
                </Button>
                {settings.seesAll && (
                  <Button color="secondary" onClick={() => fnGetCancellations(true)}>
                    <i className="bi bi-list-ul" />{IntlMessages("button.viewAll")}
                  </Button>
                )}
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ReactTable title="" columns={listColumns} data={listData} actions={[]} />
              </Colxx>
            </Row>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave} disabled={!isNew}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
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
      <Modal {...propsToModalUnpaidBills} />
      <Confirmation {...propsToMsgVoid} />
    </>
  );
};

export default ModalCancellations;
