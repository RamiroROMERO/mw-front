import { useCallback, useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { NOT_PROCESSED, normalizeProcessing, shouldFetchProcessing } from './purchaseProcessingRules';

// SPEC v2-29-sr: estado de procesamiento de la compra cargada (contabilizada, aplicada a inventario o con CxP), para bloquear los
// campos contables antes de que el back los rechace. Se vuelve a pedir cuando cambia la compra (`id`), cuando se contabiliza
// (`pdaNumber`) o cuando la pantalla lo pide (`refresh`, por ejemplo tras aplicar a inventario).
// - Una respuesta vieja nunca pisa a una más nueva: cada pedido se cancela al cambiar la compra o al desmontar.
// - "Nuevo" (id 0) descarta lo que esté en vuelo y deja el estado en blanco.
// - Si el pedido falla (404, red) no se bloquea nada: el back decide al guardar.
export const usePurchaseProcessing = ({ id, pdaNumber }) => {
  const [processing, setProcessing] = useState(NOT_PROCESSED);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!shouldFetchProcessing(id)) {
      setProcessing(NOT_PROCESSED);
      return undefined;
    }
    let cancelled = false;
    request.GET(`inventory/process/purchases/${id}/processing`, (resp) => {
      if (!cancelled) setProcessing(normalizeProcessing(resp?.data));
    }, () => {
      if (!cancelled) setProcessing(NOT_PROCESSED);
    });
    return () => { cancelled = true; };
  }, [id, pdaNumber, reload]);

  const refresh = useCallback(() => setReload((count) => count + 1), []);

  return { processing, refresh };
};
