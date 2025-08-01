import { validInt } from '@/helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@/hooks'
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { useEffect, useState } from 'react'

export const useSalesReport = ({ setLoading }) => {
  const [dataSales, setDataSales] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listBillers, setListBillers] = useState([]);
  const [listSellers, setlistSellers] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [totals, setTotals] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });


  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    storeId: 0,
    productCode: '',
    sellerId: 0,
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  });

  const { formState: formStateTotals, formValidation: formValidationTotals, isFormValid: isFormValidTotals, onInputChange: onInputChangeTotals, onResetForm: onResetFormTotals, onBulkForm: onBulkFormTotals } = useForm({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.noInvoice"),
        dataField: "noInvoice",
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
        headerStyle: { 'width': '7%' }
      },
      {
        text: IntlMessages("table.column.price"),
        dataField: "price",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '7%' }
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "storeName",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      }
    ],
    data: dataSales,
    actions: []
  });

  useEffect(() => {
    setTable({ ...table, data: dataSales });
  }, [dataSales])

  const fnSearchReport = () => {
    setDataSales([]);
    setLoading(true);
    request.POST('billing/reports/generalSales', { ...formState, toXlSX: 0 }, resp => {
      const { data } = resp;
      let { details, totals } = data;
      details = details.map(item => {
        item.qty = formatNumber(item.qty);
        item.price = formatNumber(item.price);
        item.subtotal = formatNumber(item.subtotal);
        item.discount = formatNumber(item.discount);
        item.tax = formatNumber(item.tax);
        item.total = formatNumber(item.total);
        return item;
      });
      totals = {
        qty: formatNumber(totals.qty),
        subtotal: formatNumber(totals.subtotal),
        discount: formatNumber(totals.discount),
        tax: formatNumber(totals.tax),
        total: formatNumber(totals.total)
      }
      setDataSales(details);
      setTotals(totals);
      setLoading(false);
      console.log(data);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false);

  };

  const fnExportToExcel = () => {
    setLoading(true);
    request.POST('billing/reports/generalSales', { ...formState, toXlSX: 1 }, resp => {
      const { data } = resp;
      let { details, totals } = data;
      details = details.map(item => {
        item.qty = formatNumber(item.qty);
        item.price = formatNumber(item.price);
        item.subtotal = formatNumber(item.subtotal);
        item.discount = formatNumber(item.discount);
        item.tax = formatNumber(item.tax);
        item.total = formatNumber(item.total);
        return item;
      });
      totals = {
        qty: formatNumber(totals.qty),
        subtotal: formatNumber(totals.subtotal),
        discount: formatNumber(totals.discount),
        tax: formatNumber(totals.tax),
        total: formatNumber(totals.total)
      }
      setDataSales(details);
      setTotals(totals);
      setLoading(false);
      console.log(data);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false)
  };

  const fnPrintReport = () => { };

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
      setListBillers(billers);
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

  return (
    {
      formState,
      onInputChange,
      fnSearchReport,
      fnExportToExcel,
      fnPrintReport,
      table,
      formStateTotals,
      totals,
      onInputChangeTotals,
      listCustomers, listStores, listProducts, listSellers, listBillers
    }
  )
}
