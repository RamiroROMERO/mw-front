import { request } from "@/helpers/core";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { useForm } from "@/hooks";
import { useEffect, useState } from "react";


export const useModalCompProduct = ({ setLoading, fatherCode }) => {

  const [detaDist, setDetaDist] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    fatherCode,
    productCode: "",
    qty: 0,
    status: true
  });

  const fnEditDetaItem = () => {

  }

  const [table, setTable] = useState({
    title: "",
    columns: [
      {
        text: IntlMessages("select.productId"),
        dataField: "productName",
        headerStyle: { 'width': '60%' }
      }, {
        text: IntlMessages("page.invoicing.input.qtyProd"),
        dataField: "qty",
        headerStyle: { 'width': '10%' }
      }, {
        text: IntlMessages("select.status"),
        dataField: "status",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: detaDist,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditDetaItem
    }]
  });

  const fnGetDetail = () => {

    // request.GET('/', resp => {

    //   const deta = resp.data;
    //   setDetaDist(deta);
    // }, err => {
    //   console.error(err);
    // });
  }

  useEffect(() => fnGetDetail(), []);

  const fnSave = () => {

    setSendForm(true);
    if (!isFormValid) return;

    const data = { ...formState };

    if (validInt(id) === 0) {

    } else {

    }

  }

  const fnReset = () => {
    onResetForm();

  }

  return {
    formState,
    formValidation,
    isFormValid,
    onInputChange,
    onResetForm,
    setBulkForm,
    fnSave,
    fnReset,
    propsTable: table
  }
}
