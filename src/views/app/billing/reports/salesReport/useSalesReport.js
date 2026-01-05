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
  const [dataSummary, setDataSummary] = useState([]);
  const [valChangeUsd, setValChangeUsd] = useState(0);
  const [totals, setTotals] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });
  const [totalsSummary, setTotalsSummary] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });
  const [openModalSummary, setOpenModalSummary] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    storeId: 0,
    productCode: '',
    sellerId: 0,
    documentType: 3,
    startDate: '2025-10-01',
    endDate: '2025-11-30'
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
          return (formatNumber(row.original.tax, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.total, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "storeName",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.cost"),
        dataField: "costValue",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.costValue, '', 2));
        }
      }
    ],
    data: [],
    actions: []
  });

  const [tableSummary, setTableSummary] = useState({
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
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.noInvoice"),
        dataField: "numcai",
        headerStyle: { width: "15%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.subtotal, '', 2));
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
      },
      {
        text: IntlMessages("table.column.cost"),
        dataField: "costValue",
        headerStyle: { 'width': '10%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.costValue, '', 2));
        }
      }
    ],
    data: [],
    actions: []
  });

  const fnOpenModalSummary = () => {
    setLoading(true);
    request.POST('billing/reports/generalSales/resume', { ...formState }, resp => {
      let { detail, totals } = resp;
      setTableSummary({ ...tableSummary, data: detail });
      setTotalsSummary(totals);
      setOpenModalSummary(true);
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  };

  const fnExportToExcel = async () => {
    const where = formState;
    setLoading(true);
    let data = {
      where: where,
      fields: [
        // { title: 'No.', field: 'num', type: 'decimal', length: 20 },
        { title: 'Fecha', field: 'date', type: 'String', length: 40 },
        { title: 'Cod. Documento', field: 'documentCode', type: 'String', length: 40 },
        { title: 'Num. Documento', field: 'documentId', type: 'String', length: 40 },
        { title: 'Cliente', field: 'customerName', type: 'String', length: 100 },
        { title: 'CAI', field: 'numcai', type: 'String', length: 70 },
        { title: 'Almacen', field: 'storeName', type: 'String', length: 70 },
        { title: 'Cod. Producto', field: 'productCode', type: 'String', length: 70 },
        { title: 'Producto', field: 'productName', type: 'String', length: 100 },
        { title: 'Unidad de Salida', field: 'undOut', type: 'String', length: 40 },
        { title: 'Cantidad', field: 'qty', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Precio', field: 'price', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Subtotal', field: 'subtotal', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Descuento', field: 'discount', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Impuesto', field: 'tax', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Total', field: 'total', type: 'decimal', length: 30, isSum: true, currency: true },
        { title: 'Costo', field: 'costValue', type: 'decimal', length: 30, isSum: true, currency: true },
      ],
      headerData: [],
      reportTitle: "Reporte General de Ventas",
      nameXLSXFile: "ReportedeVentasGeneral.xlsx",
    };
    await request.fnExportToXLSX("billing/reports/generalSales/generalSalesXlsx", data, "ReportedeVentasGeneral.xlsx");
    setLoading(false);
  };

  const fnPrintReport = () => { };

  const fnSearchReport = () => {
    const newActions = [
      {
        color: "primary",
        icon: "list-task",
        onClick: fnOpenModalSummary,
        title: "Resumido",
        isFreeAction: true
      },
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
      setLoading(false);
    }, false);
  };

  useEffect(() => {
    setLoading(true);
    request.GET('billing/settings/customers/?status=1', (resp) => {
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

      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/users/getSellers', (resp) => {
      const sellers = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode,
          name: item.name
        }
      });
      // const sellers = users.filter((item) => {
      //   return item.isSeller === true
      // });
      // const billers = users.filter((item) => {
      //   return item.isCashier === true
      // });
      setlistSellers(sellers);
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

      setLoading(false);
    });
  }, []);


  useEffect(() => {

    request.GET('admin/utils/getUsdChange/', resp => {
      const { data } = resp;
      setValChangeUsd(data.value || 0);
    }, err => {
      setValChangeUsd(0);
    });
  }, [])

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
      propsToHeaderReport,
      tableSummary,
      valChangeUsd,
      totalsSummary,
      openModalSummary,
      setOpenModalSummary
    }
  )
}
