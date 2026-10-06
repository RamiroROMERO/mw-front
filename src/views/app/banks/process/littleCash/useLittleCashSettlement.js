import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';

export const useLittleCashSettlement = ({ idCch, setLoading }) => {
  const [listPending, setListPending] = useState([]);
  const [totals, setTotals] = useState({ valDoctos: 0, liqPend: 0, valueCash: 0 });
  const [listBanks, setListBanks] = useState([]);
  const [listDocto, setListDocto] = useState([]);
  const [openMsgClose, setOpenMsgClose] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState({});

  const { formState, onInputChange } = useForm({
    dateIn: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateOut: DateHelper.format(DateHelper.now()),
    bankCode: '',
    documentCode: ''
  });

  const { dateIn, dateOut, bankCode, documentCode } = formState;

  const fnLoadPending = () => {
    const url = buildUrl('banks/process/littleCash/settlements', { idCch });
    request.GET(url, (resp) => {
      setListPending(resp.data);
    });
  }

  const fnCalculate = () => {
    setLoading(true);
    request.POST('banks/process/littleCash/settlements/calculate', { idCch, dateIn, dateOut }, (resp) => {
      setTotals(resp.data);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveSettlement = () => {
    setLoading(true);
    request.POST('banks/process/littleCash/settlements', { idCch, date: dateOut, dateIn, dateOut }, () => {
      setTotals({ valDoctos: 0, liqPend: 0, valueCash: 0 });
      fnLoadPending();
      notification('success', 'page.littleCashSettlement.msg.savedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  // Imprime lo guardado en DB (SPEC v2-21).
  const fnPrintSettlement = (row) => printDocument({
    path: 'banks/process/littleCash/settlements', id: row.id, fileName: 'Liquidacion de Caja Chica.pdf', setLoading
  });

  const fnAskClose = (row) => {
    if (!bankCode || !documentCode) {
      notification('warning', 'page.littleCashSettlement.msg.selectBankDocFirst', 'alert.warning.title');
      return;
    }
    setCurrentItem(row);
    setOpenMsgClose(true);
  }

  const fnCloseOk = () => {
    setOpenMsgClose(false);
    setLoading(true);
    request.POST(`banks/process/littleCash/settlements/${currentItem.id}/close`, { bankCode, documentCode }, () => {
      fnLoadPending();
      notification('success', 'page.littleCashSettlement.msg.closedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDelete = (row) => {
    setCurrentItem(row);
    setOpenMsgDelete(true);
  }

  const fnDeleteOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/littleCash/settlements/${currentItem.id}`, () => {
      fnLoadPending();
      setLoading(false);
    }, () => setLoading(false));
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.littleCashSettlement.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '15%' } },
      { text: IntlMessages("page.littleCashSettlement.table.documentId"), dataField: "documentId", headerStyle: { width: '30%' } },
      { text: IntlMessages("page.littleCashSettlement.table.valDoctos"), dataField: "valDoctos", type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages("page.littleCashSettlement.table.valueCash"), dataField: "valueCash", type: 'number', headerStyle: { width: '15%' } }
    ],
    data: [],
    actions: [{
      color: 'secondary',
      icon: 'printer',
      toolTip: IntlMessages('button.print'),
      onClick: fnPrintSettlement
    }, {
      color: 'success',
      icon: 'check',
      toolTip: IntlMessages('page.littleCashSettlement.button.close'),
      onClick: fnAskClose
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnAskDelete
    }]
  });

  useEffect(() => {
    setTable((prev) => ({ ...prev, data: listPending }));
  }, [listPending]);

  useEffect(() => {
    if (!idCch) return;
    fnLoadPending();

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
    });
    request.GET('banks/process/littleCash/settlements/documentTypes', (resp) => {
      setListDocto(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCch])

  const propsToMsgClose = { open: openMsgClose, setOpen: setOpenMsgClose, fnOnOk: fnCloseOk, title: "page.littleCashSettlement.msg.closeConfirm" }
  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteOk, title: "page.littleCashSettlement.msg.deleteConfirm" }

  return {
    formState, onInputChange, dateIn, dateOut, bankCode, documentCode,
    listBanks, listDocto, table,
    totals: {
      valDoctos: formatNumber(totals.valDoctos),
      liqPend: formatNumber(totals.liqPend),
      valueCash: formatNumber(totals.valueCash)
    },
    fnCalculate, fnSaveSettlement,
    propsToMsgClose, propsToMsgDelete
  }
}
