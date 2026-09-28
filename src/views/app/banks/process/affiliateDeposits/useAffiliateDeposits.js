import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';

// "Depósitos de Afiliadas" — a diferencia del resto del módulo, el legacy (bco_depo_intercompany.sc2)
// tiene "Nuevo"/"Guardar" deshabilitados: nunca crea documentos localmente, solo los visualiza
// (creados por el lado remoto de una afiliada vía conexión cruzada, mecanismo no replicado en
// este backend — ver PaymentRequestService/transferAffiliates). Por eso esta pantalla es un
// visor + Anular, sin formulario de captura.
export const useAffiliateDeposits = ({ setLoading }) => {
  const [dataList, setDataList] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnSearch = () => {
    setLoading(true);
    request.GET('banks/process/depositsIntercompany/search', (resp) => {
      setDataList(resp.data);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnView = (row) => {
    setLoading(true);
    request.GET(`banks/process/depositsIntercompany/${row.id}`, (resp) => {
      setSelectedHeader(resp.data.header);
      setSelectedLines(resp.data.lines);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnClose = () => {
    setSelectedHeader(null);
    setSelectedLines([]);
  }

  const fnAskDelete = () => {
    if (!selectedHeader?.id) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/depositsIntercompany/${selectedHeader.id}`, () => {
      fnClose();
      fnSearch();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteOk, title: 'page.affiliateDeposits.msg.deleteConfirm' }

  useEffect(() => {
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    dataList,
    fnView,
    selectedHeader,
    selectedLines,
    fnClose,
    fnAskDelete,
    propsToMsgDelete
  }
}
