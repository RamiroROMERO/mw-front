import { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

// Equivalente a "El Producto ya fue agregado a este Almacen" del legacy — ver InvSetProductStoreController.
const fnHandleSaveError = (err) => {
  if (err?.messages?.[0]?.message === 'storesProducts.alreadyExists') {
    notification('error', 'msg.error.storesProducts.alreadyExists', 'alert.error.title');
  } else {
    notification('error', 'msg.save.record.error', 'alert.error.title');
  }
}

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
    locationId: [(val) => validInt(val) > 0, "msg.required.select.location"]
  }

  // `locationId` (FK real a inv_ubicaciones) y `stock` deben coincidir EXACTO con los
  // nombres de atributo del modelo (`database/invSetProductsStore.js`) — antes se
  // llamaban `location`/`currentExistence`, nombres que no matcheaban ningún campo del
  // modelo, así que `getValuesPOST/PUT` los descartaba en silencio y nunca se guardaban.
  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    locationId: 0,
    stock: 0,
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
      { text: IntlMessages("page.storesProducts.table.nameProduct"), dataField: "nameProduct", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.storesProducts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
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
        item.storeName = item.storeData ? item.storeData.name : ''
        item.code = item.productId
        item.nameProduct = item.productData ? item.productData.name : ''
        return item;
      });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
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
        fnHandleSaveError(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/productsStore', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        fnHandleSaveError(err);
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
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();
    setLoading(true);
    // getSL (no /) ya filtra status=1 (solo Almacenes activos) — la ruta base find no
    // filtraba por status, por eso Almacenes desactivados seguían apareciendo acá.
    request.GET('inventory/settings/stores/getSL', (resp) => {
      // Solo Almacenes tipo 1 y 3 (a pedido del usuario) — excluye tipo 2 (bodegas de
      // clientes/proveedores) que no aplican para asignar productos. Filtrado en el
      // cliente porque el middleware global validQuery.js no soporta valores de query
      // repetidos (?type=1&type=3 rompe con "query[elem].trim is not a function").
      const listStores = resp.data
        .filter((item) => [1, 3].includes(item.type))
        .map((item) => {
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
      setLoading(false);
    });
    request.GET('inventory/settings/locations', (resp) => {
      const listLoc = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name
        }
      });
      setListLocations(listLoc);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }, []);

  // Legacy: botón sin etiqueta (ícono refresh) que llama CALL updateStokManual() —
  // recalcula inv_bodprod.existe desde el kardex real. El stored procedure ya existe
  // migrado en la base, solo faltaba conectarlo.
  const fnRefreshStock = () => {
    setLoading(true);
    request.POST('inventory/settings/productsStore/refreshStock', {}, () => {
      fnGetData();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

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
      fnRefreshStock,
      onInputChange
    }
  )
}
