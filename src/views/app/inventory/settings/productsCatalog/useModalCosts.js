import { useMemo, useState } from "react";
import { request } from "@Helpers/core";
import { useForm } from "@Hooks/useForms";
import { buildCostsPayload, costsAfterSave, mapCostsToForm, validateCosts } from "./costRules";

// Costos (inv_prodcc.sc2, SPEC v2-10-sr): tres montos independientes (costo promedio, último costo de compra y costo máximo),
// precargados con los costos actuales del producto. Guarda por PUT products/:id/costs, que exige 11.01.003; un 400 o un 403 del
// back lo muestra `request.PUT` con su mensaje real. Mismas reglas que el back (costRules.js): sin llamar al back si alguna falla.
export const useModalCosts = ({ setLoading, productId, productType, costs, setBulkForm, setOpen }) => {

  const [sendForm, setSendForm] = useState(false);
  const { formState, onInputChange } = useForm(mapCostsToForm(costs));

  const errors = useMemo(() => validateCosts(formState, productType), [formState, productType]);
  const formValidation = {
    costValueValid: errors.costValue || null,
    lastCostValueValid: errors.lastCostValue || null,
    maxCostValueValid: errors.maxCostValue || null
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    const payload = buildCostsPayload(formState);
    setLoading(true);
    request.PUT(`inventory/settings/products/${productId}/costs`, payload, () => {
      setBulkForm(costsAfterSave(payload));
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
    formValidation,
    sendForm,
    onInputChange,
    fnSave,
    fnCancel
  }
}

export default useModalCosts;
