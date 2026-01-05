import { request } from '@/helpers/core';
import { formatDate, formatNumber } from '@/helpers/Utils';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';
import { IntlMessages } from '@/helpers/Utils'

export const usePurchaseReport = ({ setLoading }) => {
  const [listProviders, setListProviders] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [openModalOtherReport, setOpenModalOtherReport] = useState(false);
  const [dataTotals, setDataTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    providerId: 0,
    storeId: 0,
    productId: 0,
    dateStart: '',
    dateEnd: '',
    isBonus: 0
  });

  const { providerId, storeId, productId, dateStart, dateEnd, isBonus } = formState;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell',
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "providerName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "storeName",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.noPurchase"),
        dataField: "purchaseCode",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.purchaseReport.table.column.description"),
        dataField: "productName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle: { 'width': '10%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.qty, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtot",
        headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.subtot, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.discount, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.tax, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '10%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.total, '', 2));
        }
      }
    ],
    data: [],
    actions: []
  });

  const fnExportToExcel = () => { }

  const fnPrintReport = () => { }

  const fnSearchReport = () => {
    const newActions = [
      {
        color: "secondary",
        icon: "file-earmark-excel",
        onClick: fnExportToExcel,
        title: "Exportar",
        isFreeAction: true
      },
      {
        color: "info",
        icon: "printer",
        onClick: fnPrintReport,
        title: "Imprimir",
        isFreeAction: true
      },
    ]

    const params = {
      providerId,
      storeId,
      productCode: productId,
      startDate: dateStart,
      endDate: dateEnd
    }

    if (isBonus === true) {
      params.isBonus = isBonus
    }

    setLoading(true);
    request.POST(`inventory/reports/mainPurchases`, params, (resp) => {
      const { detail, totals } = resp.data;
      setTable({ ...table, data: detail, actions: newActions });
      setDataTotals(totals);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    }, false);
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    request.GET(`inventory/settings/products/getSL`, (resp) => {
      const data = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.code
        }
      });
      setListProducts(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    ...formState,
    listProviders,
    listStores,
    listProducts,
    onInputChange,
    fnSearchReport
  }

  return (
    {
      table,
      dataTotals,
      propsToHeaderReport,
      listProviders,
      listStores,
      listProducts,
      openModalOtherReport,
      setOpenModalOtherReport
    }
  )
}
