import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const useDetailTable = ({ dataStatus, onBulkForm, setOpenMsgQuestion, fnDelete, currentPage, totalPages, setCurrentPage, setSearch }) => {

  const fnEditDocument = (item) => {
    item.color=item.color===null?"":item.color
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
    title: IntlMessages("page.hotel.table.bookingStatus"),
    columns: [
      { text: IntlMessages("table.column.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("table.column.color"), dataField: "color", headerStyle: { 'width': '55%' } },
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
      typePagination: 1,
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
      ...table, data: dataStatus, options: {totalPages, currentPage, setCurrentPage, typePagination: 1, setSearch}
    }
    setTable(tableData);
  },[dataStatus]);

  return (
    {
      table
    }
  )
}
