import { IntlMessages } from '@/helpers/Utils';
import { useState } from 'react'

export const useDetailTable = ({ creditNotesDetail, setCreditNotesDetail, creditNotesDetail2, setCreditNotesDetail2, setOpenModalUnpaidBill }) => {

  const fnDeleteItem = () => { }

  const [table, setTable] = useState({
    title: "",
    columns: [
      {
        label: "table.column.date",
        field: "date",
        headerStyle: { textAlign: 'center', width: '15%' }
      },
      {
        label: "table.column.invoice",
        field: "invoice",
        headerStyle: { textAlign: 'center', width: '30%' }
      },
      {
        label: "table.column.balance",
        field: "balance",
        headerStyle: { textAlign: 'center', width: '15%' }
      },
      {
        label: "table.column.discount",
        field: "discount",
        headerStyle: { textAlign: 'center', width: '15%' },
        isEditable: true
      },
      {
        label: "table.column.value",
        field: "value",
        headerStyle: { textAlign: 'center', width: '15%' },
        isEditable: true
      },
      {
        label: "table.column.options",
        field: "options",
        headerStyle: { 'width': '10%' }
      }
    ],
    data: creditNotesDetail,
    onChangeData: setCreditNotesDetail,
    options: {
      columnActions: "options",
      tableHeight: '200px'
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnDeleteItem
      }
    ]
  });

  const [table2, setTable2] = useState({
    title: "",
    columns: [
      {
        label: "table.column.code",
        field: "code",
        headerStyle: { textAlign: 'center', width: '17%' }
      },
      {
        label: "table.column.description",
        field: "description",
        headerStyle: { textAlign: 'center', width: '35%' }
      },
      {
        label: "table.column.qty",
        field: "qty",
        headerStyle: { textAlign: 'center', width: '12%' }
      },
      {
        label: "table.column.total",
        field: "total",
        headerStyle: { textAlign: 'center', width: '12%' }
      },
      {
        label: "table.column.qtyReturn",
        field: "qtyReturn",
        headerStyle: { textAlign: 'center', width: '12%' },
        isEditable: true
      },
      {
        label: "table.column.total",
        field: "totalReturn",
        headerStyle: { textAlign: 'center', width: '12%' }
      }
    ],
    data: creditNotesDetail2,
    onChangeData: setCreditNotesDetail2,
    options: {
      columnActions: "options",
      tableHeight: '200px'
    }
  });

  const fnViewInvoices = () => {
    setOpenModalUnpaidBill(true);
  }

  const fnApply = () => { }

  return (
    {
      table2,
      table,
      fnViewInvoices,
      fnApply
    }
  )
}
