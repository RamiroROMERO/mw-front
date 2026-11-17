import { useEffect, useMemo, useState } from 'react'
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import { INITIAL_PAYMENT_METHOD_FORM, buildPaymentMethodPayload, mapPaymentMethodToForm, validatePaymentMethod } from './paymentMethodRules';

// Formas de pago, cabecera (fac_formpag.sc2). Validación por campo con las mismas reglas del back (paymentMethodRules.js): un formulario inválido se marca y NO llama al back.
// "Eliminar" es una baja lógica con bloqueo por uso (DELETE admin/paymentTypes/:id; el back rechaza con su mensaje real si algún documento la usa): la casilla "Activa"
// sigue siendo independiente. La unicidad de la predeterminada la valida el back (`paymentType.alreadyDefault`) y `request` muestra su mensaje real.
export const usePaymentMethods = ({ setLoading }) => {
  const [tableData, setTableData] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);

  const { formState, onInputChange, onResetForm, onBulkForm } = useForm({ ...INITIAL_PAYMENT_METHOD_FORM });
  const errors = useMemo(() => validatePaymentMethod(formState), [formState]);

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/paymentTypes', (resp) => {
      setTableData(resp.data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnEditItem = (item) => {
    setSendForm(false);
    onBulkForm(mapPaymentMethodToForm(item));
  }

  const fnDeleteItem = (item) => {
    onBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnRemove = () => {
    setOpenMsgQuestion(false);
    if (!(validInt(formState.id) > 0)) return;
    setLoading(true);
    request.DELETE(`admin/paymentTypes/${formState.id}`, () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    }, () => {
      // Rechazada (en uso): `request` ya mostró el mensaje real; se limpia para que un Guardar posterior no edite lo que se intentó eliminar.
      fnClearInputs();
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildPaymentMethodPayload(formState);
    setLoading(true);
    const done = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    if (validInt(formState.id) > 0) {
      request.PUT(`admin/paymentTypes/${formState.id}`, data, done, () => setLoading(false));
    } else {
      request.POST('admin/paymentTypes', data, done, () => setLoading(false));
    }
  }

  const fnViewDetail = () => {
    if (validInt(formState.id) === 0) return;
    setOpenModalDetail(true);
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnRemove, title: "alert.question.title", onResetForm }

  const propsToDetailTable = { tableData, fnEditItem, fnDeleteItem };

  const propsToDetail = { formState, errors, sendForm, onInputChange, fnClearInputs, fnSave, fnViewDetail };

  return {
    recordId: formState.id,
    recordName: formState.name,
    propsToMsgDelete,
    propsToDetail,
    propsToDetailTable,
    openModalDetail,
    setOpenModalDetail
  }
}
