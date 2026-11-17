import { IntlMessages, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks/useForms'
import { useEffect, useMemo, useState } from 'react'
import { DETAIL_PATH, INITIAL_DETAIL_FORM, buildDetailPayload, mapDetailToForm, validateDetail } from './paymentMethodRules';

// Formas de pago, cuentas (fac_formpagctas.sc2). Validación por campo con las mismas reglas del back (paymentMethodRules.js): un formulario inválido se marca y NO llama al back.
// Eliminar una línea es un borrado real que el back rechaza (con su mensaje) si algún documento la usa; entonces se desactiva con la casilla "Activa".
export const useModalDetail = ({ setLoading, selectedItem }) => {

  const [sendForm, setSendForm] = useState(false);
  const [contCtasList, setContCtasList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [currentItemDetail, setCurrentItemDetail] = useState({});
  const [msgQuestionDeleteDetail, setMsgQuestionDeleteDetail] = useState(false);

  const { formState, onInputChange, onBulkForm, onResetForm } = useForm({ ...INITIAL_DETAIL_FORM, paymentTypeId: selectedItem || 0 });
  const errors = useMemo(() => validateDetail(formState), [formState]);

  const fnNewDetail = () => {
    onResetForm();
    setSendForm(false);
    setCurrentItemDetail({});
  }

  const fnEditDetail = (item) => {
    onBulkForm(mapDetailToForm(item));
    setCurrentItemDetail(item);
    setSendForm(false);
  };

  const fnDeleteDetail = (item) => {
    setCurrentItemDetail(item);
    setMsgQuestionDeleteDetail(true);
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("page.paymentMethods.table.name"), dataField: "description", headerStyle: { 'width': '75%' } },
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditDetail
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteDetail
    }]
  })

  const fnGetTableData = () => {
    request.GET(buildUrl(DETAIL_PATH, { paymentTypeId: selectedItem }), res => {
      setTable((prev) => ({ ...prev, data: res.data }));
    }, () => { })
  }

  const fnSaveDetail = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildDetailPayload(formState, selectedItem);
    const done = () => {
      fnGetTableData();
      fnNewDetail();
    };
    if (validInt(formState.id) === 0) {
      request.POST(DETAIL_PATH, data, done, () => { });
    } else {
      request.PUT(`${DETAIL_PATH}/${formState.id}`, data, done, () => { });
    }
  }

  const fnGetInitialData = () => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL?status=1', (resp) => {
      setContCtasList(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('billing/settings/customers/getSL', res => {
      setCustomerList(res.data.map(item => ({ label: `${item.nomcli}`, value: item.id })));
    }, () => { });
  }

  const fnDelete = () => {
    setMsgQuestionDeleteDetail(false);
    if (validInt(currentItemDetail.id) === 0) return;

    request.DELETE(`${DETAIL_PATH}/${currentItemDetail.id}`, () => {
      fnGetTableData();
      fnNewDetail();
    }, () => {
      // Rechazada (en uso): `request` ya mostró el mensaje real; el formulario no queda apuntando a esa línea.
      fnNewDetail();
    })
  }

  useEffect(() => {
    fnGetInitialData();
    fnGetTableData();
  }, [])

  const propsToMsgDeleteDetail = { open: msgQuestionDeleteDetail, setOpen: setMsgQuestionDeleteDetail, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem: setCurrentItemDetail }

  return {
    formState,
    errors,
    onInputChange,
    sendForm,
    contCtasList,
    customerList,
    table,
    fnSaveDetail,
    fnNewDetail,
    propsToMsgDeleteDetail
  }
}
