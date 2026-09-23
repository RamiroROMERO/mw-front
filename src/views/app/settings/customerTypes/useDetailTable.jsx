import { IntlMessages } from '@Helpers/Utils';

export const useDetailTable = ({onBulkForm, setOpenMsgQuestion, tableData, listAccount = []}) => {

  const fnEditItem = (item) => {
    onBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const table = {
    title: IntlMessages("page.customerTypes.table.title"),
    columns: [
      { text: IntlMessages("page.customerTypes.table.name"), dataField: "name", headerStyle: { 'width': '50%' } },
      {
        text: IntlMessages("page.customerTypes.table.idCtaCxp"), dataField: "idCtaCxp", headerStyle: { 'width': '30%' },
        cell: ({ row }) => {
          const account = listAccount.find((item) => item.value === row.original.idCtaCxp);
          return account ? account.label : row.original.idCtaCxp;
        }
      },
      {
        text: IntlMessages("check.status"), dataField: "status", headerStyle: { 'width': '20%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell',
        cell: ({ row }) => ((row.original.status === 1 || row.original.status === true)
          ? <i className="medium-icon bi bi-check2-square" />
          : <i className="medium-icon bi bi-square" />)
      }
    ],
    data: tableData,
    actions: [{
      color: 'warning',
      onClick: fnEditItem,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteItem,
      icon: 'trash'
    }],
  };

  return (
    {
      table
    }
  )
}
