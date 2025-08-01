import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';

export const useStoresProducts = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [listLocations, setListLocations] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddLocations, setOpenModalAddLocation] = useState(false);
  const [openModalAddxLotes, setOpenModalAddxLotes] = useState(false);

  const storesProductsValid = {
    storeId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    productId: [(val) => val.length > 0, "msg.required.select.product"],
    location: [(val) => val.length > 0, "msg.required.select.location"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    location: 0,
    currentExistence: 0,
    qtyMin: 0,
    qtyMax: 0,
    storeId: 0,
    productId: 0,
    status: 1
  }, storesProductsValid);

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.storesProducts.table.title"),
    columns: [
      {
        text: IntlMessages("page.storesProducts.table.warehouse"), dataField: "storeName", headerStyle: { 'width': '20%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("page.storesProducts.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.storesProducts.table.nameProduct"), dataField: "nameProduct", headerStyle: { 'width': '45%' } }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/productsStore', (resp) => {
      const data = resp.data.map((item) => {
        item.storeName = item.invStore ? item.invStore.name : ''
        item.code = item.productId
        item.nameProduct = item.invProduct ? item.invProduct.name : ''
        return item;
      });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/productsStore/${currentItem.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/productsStore', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/productsStore/${currentItem.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();
    setLoading(true);
    request.GET('inventory/settings/stores', (resp) => {
      const listStores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          name: item.name,
          id: item.id,
        }
      });
      setListWarehouse(listStores);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    request.GET('inventory/settings/products', (resp) => {
      const listProd = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.code
        }
      });
      setListProducts(listProd);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    request.GET('inventory/settings/locations', (resp) => {
      const listLoc = resp.data.map((item) => {
        return {
          id: item.name,
          name: item.name
        }
      });
      setListLocations(listLoc);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      listLocations,
      listProducts,
      listWarehouse,
      openModalAddLocations,
      openModalAddxLotes,
      setOpenModalAddLocation,
      setOpenModalAddxLotes,
      setListLocations,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
