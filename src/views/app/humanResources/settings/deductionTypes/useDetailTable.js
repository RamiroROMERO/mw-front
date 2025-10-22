import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const useDetailTable = ({ dataDeductions, onBulkForm, setOpenMsgQuestion, fnDelete }) => {

  const fnEditDocument = (item) => {
    onBulkForm(item);
  }

  const fnDeleteDocument = (item) => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.humanResources.deductionTypes"),
    columns: [
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("input.ctaAccount"), dataField: "ctaAccount", headerStyle: { 'width': '55%' } },
      {
        text: IntlMessages("check.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [{
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteDocument,
      icon: 'trash'
    }],
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataDeductions};
    setTable(dataTable);
  },[dataDeductions]);

  return (
    {
      table
    }
  )
}
