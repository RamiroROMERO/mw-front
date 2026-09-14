import { useEffect, useState } from "react";
import { validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks/useForms";

// Copiar Producto (inv_prod_copy.sc2) — el diálogo legacy solo pide Clasificación/Código/Nombre
// del producto nuevo; la clonación real del resto de los campos la hace el form padre
// (Controlpanelbtn7.Click en inv_products.sc2), reusando el mismo payload que un alta normal.
const copyValid = {
  newTypeId: [(val) => validInt(val) > 0, "msg.required.select.classification2"],
  newCode: [(val) => val !== "", "msg.required.input.code"],
  newName: [(val) => val !== "", "msg.required.input.name"]
};

export const useModalCopy = ({ currentTypeId, listClassifications, fnSaveCopy, setOpen }) => {

  const { formState, formValidation, isFormValid, onInputChange, setBulkForm } = useForm({
    newTypeId: 0,
    newCode: '',
    newName: ''
  }, copyValid);

  const [sendForm, setSendForm] = useState(false);

  useEffect(() => {
    setBulkForm({ newTypeId: currentTypeId || 0, newCode: '', newName: '' });
    setSendForm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Legacy Commandbutton_hw3.Click: si hay Clasificación seleccionada, usa su correlativo
  // (codeInit-codeSeq+1); si no, genera un código aleatorio (misma convención que fnGenerateCode
  // del form principal).
  const fnGenerateCode = () => {
    const { newTypeId } = formState;
    const filter = listClassifications.filter((item) => item.value === newTypeId);
    if (filter.length === 0) {
      const codeRandom = new Uint32Array(1);
      window.crypto.getRandomValues(codeRandom);
      onInputChange({ target: { name: 'newCode', value: `${codeRandom[0]}` } });
      return;
    }
    const nextCode = `${parseInt(filter[0].codeSeq, 10) + 1}`;
    const codeType = `${filter[0].codeInit}-${nextCode.padStart(5, 0)}`;
    onInputChange({ target: { name: 'newCode', value: codeType } });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) return;
    const { newTypeId, newCode, newName } = formState;
    fnSaveCopy(newTypeId, newCode, newName);
  }

  const fnCancel = () => {
    setOpen(false);
  }

  return {
    formState,
    formValidation,
    sendForm,
    onInputChange,
    fnGenerateCode,
    fnSave,
    fnCancel
  }
}

export default useModalCopy;
