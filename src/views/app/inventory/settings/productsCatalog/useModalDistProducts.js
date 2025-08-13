import React, { useEffect, useState } from 'react'
import { IntlMessages, validFloat, validInt } from "@/helpers/Utils";
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';
import TableButton from '@/components/tableButtons';

const UseModalDistProducts = (props) => {
  const { setLoading, productCode } = props;

  const [sendForm, setSendForm] = useState(false);
  const [detaDist, setDetaDist] = useState([]);

  const productDistValid = {
    undCode: [(val) => val !== "", "msg.required.input.undOut"],
    valChange: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    localMinPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    localMedPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    localMaxPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    foranMinPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    foranMedPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"],
    foranMaxPrice: [(val) => validInt(val) >= 0, "msg.required.input.valChange"]

  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    idFather: productCode,
    undCode: "",
    undOut: "",
    valChange: 0,
    localMinPrice: 0,
    localMedPrice: 0,
    localMaxPrice: 0,
    localOtherPrice: 0,
    foranMinPrice: 0,
    foranMedPrice: 0,
    foranMaxPrice: 0,
    foranOtherPrice: 0,
    isDefault: false,
    status: true,
  }, productDistValid);

  const { id, undOut, undCode, valChange, localMinPrice, localMedPrice, localMaxPrice, foranMinPrice, foranMedPrice, foranMaxPrice, foranOtherPrice, isDefault, status } = formState;

  const fnEditDetaItem = (item) => {
    setBulkForm(item);
  };

  const fnDeleteDetaItem = (item) => {
    if (item.isDefault) {
      return;
    }
  };

  const fnGetDistData = () => {
    setLoading(true);
    request.GET(`inventory/settings/productsDistributions?idFather=${productCode}`, res => {
      const { data } = res;
      const detaDistRefresh = data.map(elem => {
        elem.options = <><TableButton color='warning' icon='pencil' fnOnClick={() => fnEditDetaItem(elem)} />
          <TableButton color='danger' icon='trash' fnOnClick={() => fnDeleteDetaItem(elem)} /></>
      })
      setDetaDist(detaDistRefresh);
      setTable({ ...table, data: data });
      setLoading(false);
    }, err => {
      setDetaDist([]);
      setLoading(false);
    })
  };

  const fnClearDetaItem = () => {
    onResetForm();
  };

  const fnSaveDetaItem = () => {
    setSendForm(true)
    if (!isFormValid) {
      console.log("formulario invalido!");
      return;
    }
    if (validFloat(localMinPrice) <= 0 && validFloat(localMedPrice) <= 0 && validFloat(localMaxPrice) <= 0) {
      return;
    }
    const data = {
      idFather: productCode,
      undCode,
      undOut, valChange, localMinPrice, localMedPrice, localMaxPrice, foranMaxPrice, foranMedPrice, foranMinPrice, isDefault, status
    };
    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('inventory/settings/productsDistributions', data, res => {
        fnGetDistData();
        setLoading(false);
        setSendForm(false);
        onResetForm();
      }, err => {
        setLoading(false);
      });
    } else {
      request.PUT(`inventory/settings/productsDistributions/${id}`, data, res => {
        fnGetDistData();
        setSendForm(false);
        onResetForm();
        setLoading(false);
      }, err => {
        setLoading(false);
      });
    }
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.productsCatalog.modal.distProduct.table.title"),
    columns: [
      {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.measureUnit"),
        dataField: "measureName",
        headerStyle: { 'width': '15%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.baseValue"),
        dataField: "valChange",
        headerStyle: { 'width': '10%' }
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.minPrice"),
        dataField: "localMinPrice",
        headerStyle: { 'width': '15%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.maxPrice"),
        dataField: "localMedPrice",
        headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      }, {
        text: IntlMessages("page.productsCatalog.modal.distProduct.table.column.maxPrice"),
        dataField: "localMaxPrice",
        headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      }
    ],
    data: detaDist,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditDetaItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteDetaItem
    }]
  });

  useEffect(() => {
    fnGetDistData();
  }, [])

  return {
    table,
    formState,
    formValidation,
    isFormValid,
    onInputChange,
    sendForm,
    fnClearDetaItem,
    fnSaveDetaItem
  }
}

export default UseModalDistProducts;
