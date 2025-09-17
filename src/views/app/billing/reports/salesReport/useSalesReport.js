import { formatDate } from '@/helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@/hooks'
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { useEffect, useState } from 'react'

export const useSalesReport = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [listSellers, setlistSellers] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [totals, setTotals] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    storeId: 0,
    productCode: '',
    sellerId: 0,
    startDate: '2024-01-01',
    endDate: '2025-12-30'
  });

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell',
        cell: ({row}) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.noInvoice"),
        dataField: "numcai",
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
        text: IntlMessages("table.column.outputUnit"),
        dataField: "undOut",
        headerStyle: { 'width': '8%' }
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.qty, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.price"),
        dataField: "price",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.price, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.discount, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.tax, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.total, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "storeName",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      }
    ],
    data: [],
    actions: []
  });

  const fnExportToExcel = () => { };

  const fnPrintReport = () => { };

  const fnSearchReport = () => {
    const newActions = [
      {
        color: "secondary",
        icon: "file-earmark-excel",
        onClick: fnExportToExcel,
        title: "Exportar",
        isFreeAction: true
      }
    ]

    setLoading(true);
    request.POST('billing/reports/generalSales', { ...formState, toXlSX: 0 }, resp => {
      let { detail, totals } = resp;
      setTable({ ...table, data: detail, actions: newActions });
      setTotals(totals);
      setLoading(false);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false);
  };

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/users?status=1', (resp) => {
      const users = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode,
          isSeller: item.isSeller,
          isCashier: item.isCashier,
          name: item.name
        }
      });
      const sellers = users.filter((item) => {
        return item.isSeller === 1
      });
      const billers = users.filter((item) => {
        return item.isCashier === 1
      });
      setlistSellers(sellers);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/settings/products/getSL`, (resp) => {
      const data = resp.data.map((item) => {
        return {
          label: `${item.code} ${item.name}`,
          value: item.code
        }
      });
      setListProducts(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    formState,
    onInputChange,
    listCustomers,
    listSellers,
    listStores,
    listProducts,
    fnSearchReport
  }

  return (
    {
      totals,
      table,
      propsToHeaderReport
    }
  )
}
