import { useEffect, useMemo, useState } from "react";
import { request } from "@Helpers/core";
import { useForm } from "@Hooks/useForms";
import { INITIAL_CASH_BOX_FORM, buildCashBoxPayload, mapCashBoxToForm, validateCashBox } from "./cashBoxRules";

// Cajas de cobro (fac_cajas.sc2). Validación por campo con las mismas reglas del back (cashBoxRules.js): un formulario inválido se marca y NO llama al back. El área de
// facturación es opcional (como el legacy). "Eliminar" es una baja lógica con bloqueo por uso (DELETE /billing/settings/cashRegisters/:id; el back rechaza con su mensaje
// real si la caja tiene facturas, cancelaciones, cierres, etc.): la casilla "Activa" sigue siendo independiente.
const useCashBoxes = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [listBillingArea, setListBillingArea] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, onResetForm, onBulkForm } = useForm({ ...INITIAL_CASH_BOX_FORM });
  const errors = useMemo(() => validateCashBox(formState), [formState]);

  const fnClearInputs = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnEditItem = (item) => {
    setSendForm(false);
    onBulkForm(mapCashBoxToForm(item));
  }

  const fnDeleteItem = (item) => {
    setSelectedItem({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('billing/settings/cashRegisters', (resp) => {
      setTableData(resp.data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildCashBoxPayload(formState);
    setLoading(true);
    const done = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    if (formState.id > 0) {
      request.PUT(`billing/settings/cashRegisters/${formState.id}`, data, done, () => setLoading(false));
    } else {
      request.POST('billing/settings/cashRegisters', data, done, () => setLoading(false));
    }
  }

  // Baja lógica (elimina = 1). Si el back la rechaza `request.DELETE` ya muestra su mensaje real y la tabla conserva la caja.
  const fnDeleteDocument = () => {
    setOpenMsgQuestion(false);
    if (!(selectedItem.id > 0)) return;
    setLoading(true);
    request.DELETE(`billing/settings/cashRegisters/${selectedItem.id}`, () => {
      if (selectedItem.id === formState.id) fnClearInputs();
      setSelectedItem({});
      fnGetData();
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
    request.GET('accounting/settings/accountants/getSL?status=1', (resp) => {
      setListLedgerAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    });
    request.GET('admin/areas?status=1&useBilling=1', (resp) => {
      setListBillingArea(resp.data.map((item) => ({ label: item.name, value: item.id })));
    });
  }, []);

  const propsToDetailTable = {
    tableData,
    fnEditItem,
    fnDeleteItem
  }

  const propsToDetail = {
    formState,
    errors,
    sendForm,
    listBillingArea,
    listLedgerAccount,
    onInputChange,
    fnSave,
    fnClearInputs
  };

  return {
    propsToMsgDelete: {
      open: openMsgQuestion,
      setOpen: setOpenMsgQuestion,
      fnOnOk: fnDeleteDocument,
      title: "alert.question.title"
    },
    propsToDetail,
    propsToDetailTable
  }
};

export default useCashBoxes;
