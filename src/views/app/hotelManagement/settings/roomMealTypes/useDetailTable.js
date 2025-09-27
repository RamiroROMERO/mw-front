import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const useDetailTable = ({ dataMealTypes, onBulkForm, setOpenMsgQuestion, fnDelete, currentPage, totalPages, setCurrentPage, setSearch }) => {

  const fnEditDocument = (item) => {
    onBulkForm(item);
  }

  const fnDisableDocument = (item) => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.table.roomMealTypes"),
    columns: [
      { text: IntlMessages("table.column.name"), dataField: "name", headerStyle: { 'width': '90%' } },
      {
        text: IntlMessages("table.column.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options',
      currentPage,
      totalPages,
      typePagination: 2,
      setCurrentPage
    },
    actions: [{
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDisableDocument,
      icon: 'x-circle'
    }],
  });

  useEffect(()=>{
    const tableData = {
      ...table, data: dataMealTypes, options: {totalPages, currentPage, setCurrentPage, typePagination: 2, setSearch}
    }
    setTable(tableData);
  },[dataMealTypes]);

  return (
    {
      table
    }
  )
}
