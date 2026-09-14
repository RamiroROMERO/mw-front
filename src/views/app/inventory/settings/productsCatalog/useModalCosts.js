import { request } from "@Helpers/core";
import { useForm } from "@Hooks/useForms";

// Costos (inv_prodcc.sc2) — diálogo de un producto que NO precarga el costo actual
// (siempre arranca en 0, igual que el legacy). Al guardar, sincroniza costo/ultcosto/
// ultcostoc/costom al mismo valor nuevo (no distingue por tipo de producto, ni siquiera
// para Servicios — el legacy tampoco valida eso).
export const useModalCosts = ({ setLoading, productId, setBulkForm, setOpen }) => {

  const { formState, onInputChange } = useForm({
    newCostValue: 0
  });

  const fnSave = () => {
    const { newCostValue } = formState;
    const data = {
      costValue: newCostValue,
      lastCostValue: newCostValue,
      lastCostPurchValue: newCostValue,
      maxCostValue: newCostValue
    };
    setLoading(true);
    request.PUT(`inventory/settings/products/${productId}`, data, () => {
      setBulkForm(data);
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
    fnSave,
    fnCancel
  }
}

export default useModalCosts;
