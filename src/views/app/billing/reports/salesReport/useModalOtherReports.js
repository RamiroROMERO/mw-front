import { IntlMessages } from '@/helpers/Utils';
import { useForm } from '@/hooks'
import { useState } from 'react';

const useModalOtherReports = () => {
  const [dataSales, setDataSales] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    storeId: 0,
    productId: 0,
    sellerId: 0,
    dateStart: '',
    dateEnd: ''
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
        dataField: "customer",
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
        dataField: "description",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.outputUnit"),
        dataField: "outputUnit",
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
        dataField: "store",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      }
    ],
    data: dataSales,
    actions: []
  });

  const fnSearchReport = () => { };

  const fnExportToExcel = () => { };

  const fnPrintReport = () => { };

  return (
    {
      formState,
      onInputChange,
      fnSearchReport,
      fnExportToExcel,
      fnPrintReport,
      table,
      formStateTotals,
      onInputChangeTotals
    }
  )
}

export default useModalOtherReports