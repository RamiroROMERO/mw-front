import { Colxx } from "@Components/common/CustomBootstrap";
import { ReactTableEdit } from "@Components/reactTableEdit";
import { InputField } from "@Components/inputFields";
import { useEffect, useRef, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import notification from '@Containers/ui/Notifications';
import { CANCELLATION_PATH, toCents } from "./posCancellationRules";

const SEARCH_DELAY_MS = 300;

// Facturas pendientes del cliente (SPEC v2-89-sr): el saldo sale de la fórmula real del back, con búsqueda en el servidor. Lo digitado en una búsqueda se conserva al buscar otra.
const ModalUnpaidBills = (props) => {
  const { data, setOpen } = props;
  const { customerId, sessionId, fnAddDocuments, setLoading } = data;

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const typed = useRef({});
  const seen = useRef({});
  const timer = useRef(null);
  const lastRequest = useRef(0);

  const fnLoad = (term) => {
    if (!customerId) { setRows([]); return; }
    const requestId = lastRequest.current + 1;
    lastRequest.current = requestId;
    setLoading(true);
    request.GET(buildUrl(`${CANCELLATION_PATH}/pending`, { sessionId, customerId, search: term, limit: 50 }), (resp) => {
      if (requestId !== lastRequest.current) return;
      resp.data.forEach((item) => { seen.current[item.id] = { documentCode: item.documentCode, balance: item.balance }; });
      setRows(resp.data.map((item) => ({
        id: item.id,
        date: item.date,
        noInvoice: item.documentCode,
        invoiceBalance: formatNumber(item.balance),
        balance: item.balance,
        valuePaid: typed.current[item.id] || ""
      })));
      setLoading(false);
    }, () => setLoading(false), false);
  };

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnLoad(search), SEARCH_DELAY_MS);
    return () => clearTimeout(timer.current);
  }, [customerId, search]);

  const fnChange = (list) => {
    list.forEach((item) => { typed.current[item.id] = item.valuePaid; });
    setRows(list);
  };

  const fnSave = () => {
    const selected = Object.entries(typed.current).filter(([, value]) => String(value ?? "").trim() !== "" && toCents(value) !== null);
    if (selected.length === 0) {
      notification('warning', 'page.pointSales.modal.unpaidBills.validation.noSelection', 'alert.warning.title');
      return;
    }
    const docs = selected.map(([id, value]) => {
      const item = seen.current[id];
      return item ? { id: Number(id), documentCode: item.documentCode, balance: item.balance, valuePaid: String(value).trim() } : null;
    }).filter(Boolean);
    const over = docs.find((doc) => toCents(doc.valuePaid) > Math.round(Number(doc.balance) * 100));
    if (over) {
      notification('warning', 'page.pointSales.modal.unpaidBills.validation.overpaid', 'alert.warning.title');
      return;
    }
    fnAddDocuments(docs);
    setOpen(false);
  };

  const table = {
    title: IntlMessages("page.pointSales.modal.unpaidBills.table.title"),
    columns: [
      { label: "page.pointSales.modal.unpaidBills.table.date", field: "date", headerStyle: { textAlign: 'center', width: '15%' }, bodyStyle: { width: '15%' } },
      { label: "page.pointSales.modal.unpaidBills.table.noInvoice", field: "noInvoice", headerStyle: { textAlign: 'center', width: '30%' }, bodyStyle: { width: '30%' } },
      { label: "page.pointSales.modal.unpaidBills.table.invoiceBalance", field: "invoiceBalance", headerStyle: { textAlign: 'center', width: '25%' }, bodyStyle: { width: '25%', textAlign: 'right' } },
      { label: "page.pointSales.modal.unpaidBills.table.valuePaid", field: "valuePaid", isEditable: true, headerStyle: { textAlign: 'center', width: '30%' }, bodyStyle: { width: '30%' } }
    ],
    data: rows,
    onChangeData: fnChange,
    options: { columnActions: "options", tableHeight: '300px' }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12" md="6">
            <InputField value={search} name="search" onChange={(e) => setSearch(e.target.value)} type="text" label="page.pointSales.modal.unpaidBills.input.search" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalUnpaidBills;
