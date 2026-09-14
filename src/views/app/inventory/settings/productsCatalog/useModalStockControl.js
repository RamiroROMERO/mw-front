import { request } from "@Helpers/core";
import { useForm } from "@Hooks/useForms";
import { useEffect } from "react";

// Control de Existencias (inv_prod_ce.sc2) — parámetros de reabastecimiento por temporada,
// edita el mismo producto actual (no es una lista/hijo, es un update puntual sobre inv_prod).
export const useModalStockControl = ({ setLoading, productId, product, setBulkForm, setOpen }) => {

  const { formState, onInputChange, setBulkForm: setBulkModalForm } = useForm({
    season: 1,
    frequency: 0,
    productionTime: 0,
    providerId: 0,
    minQtyHigh: 0,
    percentBadHandlingHigh: 0,
    percentMaxBadHandlingHigh: 0,
    minQtyLow: 0,
    percentBadHandlingLow: 0,
    percentMaxBadHandlingLow: 0
  });

  useEffect(() => {
    if (!product) return;
    setBulkModalForm({
      season: product.season || 1,
      frequency: product.frequency || 0,
      productionTime: product.productionTime || 0,
      providerId: product.providerId || 0,
      minQtyHigh: product.minQtyHigh || 0,
      percentBadHandlingHigh: product.percentBadHandlingHigh || 0,
      percentMaxBadHandlingHigh: product.percentMaxBadHandlingHigh || 0,
      minQtyLow: product.minQtyLow || 0,
      percentBadHandlingLow: product.percentBadHandlingLow || 0,
      percentMaxBadHandlingLow: product.percentMaxBadHandlingLow || 0
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Legacy Textbox_hw2.Valid: clamp Frecuencia a 4 (1-4 Semanas).
  const fnFrequencyBlur = ({ target }) => {
    if (parseInt(target.value) > 4) {
      onInputChange({ target: { name: 'frequency', value: 4 } });
    }
  }

  const fnSave = () => {
    setLoading(true);
    request.PUT(`inventory/settings/products/${productId}`, { ...formState }, () => {
      setBulkForm({ ...formState });
      setLoading(false);
      setOpen(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnCancel = () => {
    setOpen(false);
  }

  return {
    formState,
    onInputChange,
    fnFrequencyBlur,
    fnSave,
    fnCancel
  }
}

export default useModalStockControl;
