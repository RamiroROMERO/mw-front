import { useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const usePayments = ({ setLoading }) => {
  const [allData, setAllData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [appliedDocuments, setAppliedDocuments] = useState([]);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });

  const { dateStart, dateEnd, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages('menu.payments'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '12%' } },
      { text: IntlMessages('table.column.beneficiary'), dataField: 'providerName', headerStyle: { width: '30%' } },
      { text: IntlMessages('table.column.value'), dataField: 'value', type: 'number', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.checkRequest.title.typeRequest'), dataField: 'type', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.checkRequest.input.numberId'), dataField: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('select.bankCode'), dataField: 'bankName', headerStyle: { width: '20%' } }
    ],
    data: [],
    actions: [{
      color: 'primary',
      icon: 'eye',
      toolTip: 'button.view',
      onClick: (row) => fnSelectRow(row)
    }]
  });

  const fnSearchReport = () => {
    if (dateStart > dateEnd) {
      notification('warning', 'page.diaryBook.msg.invalidDateRange', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('banks/reports/payments/search', { dateStart, dateEnd }), (resp) => {
      setAllData(resp.data);
      setTable((prev) => ({ ...prev, data: resp.data }));
      setSelectedRow(null);
      setAppliedDocuments([]);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnFilterData = (value) => {
    if (!value) {
      setTable((prev) => ({ ...prev, data: allData }));
      return;
    }
    const upperValue = value.toUpperCase();
    const filtered = allData.filter((item) => (
      `${item.providerName || ''}${item.bankName || ''}${item.number || ''}`.toUpperCase().includes(upperValue)
    ));
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
  }

  const fnSelectRow = (row) => {
    setSelectedRow(row);
    setLoading(true);
    request.GET(buildUrl('banks/reports/payments/appliedDocuments', {
      id: row.id, typeDocument: row.typeDocument, providerId: row.providerId
    }), (resp) => {
      setAppliedDocuments(resp.data);
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToHeaderReport = {
    dateStart, dateEnd, search, onInputChange, onSearchChange, fnSearchReport
  }

  return {
    table,
    propsToHeaderReport,
    selectedRow,
    appliedDocuments
  }
}
