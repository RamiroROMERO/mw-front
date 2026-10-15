import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { validateStore, buildStorePayload } from './storeRules';

export const useStore = ({ setLoading }) => {

  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [dataTable, setDataTable] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  // "Crédito Fertilizantes" solo se muestra si la empresa tiene coffeeControl activo
  // (mw_setting.coffee), igual que Checkbox_hw2.Init en el legacy.
  const [coffeeControl, setCoffeeControl] = useState(false);
  // Contabilidad activa (mw_setting.cont_menu): sin ella no se piden ni se envían las cuentas contables. Mientras no se
  // conoce se asume activa (el back decide); el valor real llega con admin/companyInternalSettings.
  const [accountingActive, setAccountingActive] = useState(true);
  const listType = [{ id: 1, name: "Almacen" }, { id: 2, name: "Centro de Destino" }, { id: 3, name: "Ambos" }]

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    type: 0, // sin selección inicial: el usuario debe elegirlo (1 Almacén, 2 Centro de Destino, 3 Ambos)
    status: true,
    invCtaCode: '',
    costCtaCode: '',
    expenseCtaCode: '',
    fertilizerCredit: false
  });

  // Mismas reglas que el back (storeRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateStore(formState, { accountingActive }), [formState, accountingActive]);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.store.table.title"),
    columns: [
      { text: IntlMessages("page.store.table.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.store.table.type"), dataField: "typeName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.store.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } },
    ],
    options: {
      showViewColumns: true
    },
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnDeleteItem,
      title: IntlMessages('button.delete')
    }]
  });

  const fnClearInputs = () => {
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/stores', (resp) => {
      const data = resp.data.map((item) => {
        item.typeName = item.type === 1 ? "Almacen" : item.type === 2 ? "Centro de Destino" : "Ambos"
        return item;
      });
      setDataTable(data)
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = buildStorePayload(formState, { accountingActive, coffeeActive: coffeeControl });

    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/stores/${currentItem.id}`, payload, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/stores', payload, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      // Eliminar (elimina = 1) solo si el almacén no tiene documentos ni movimientos; el back lo rechaza si tiene uso.
      // La casilla "Activa" (status) es independiente.
      request.DELETE(`inventory/settings/stores/${currentItem.id}`, (resp) => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListLedgerAccounts([...listAccounts]);
      setLoading(false);
      fnGetData();
    }, (err) => {
      setLoading(false);
    });

    const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setCoffeeControl(!!settings?.coffeeControl);
        setAccountingActive(!!settings?.accountingMenu);
      }, () => { });
    }
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      listType,
      listLedgerAccounts,
      coffeeControl,
      accountingActive,
      errors,
      table,
      dataTable,
      propsToMsgDelete,
      formState,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
