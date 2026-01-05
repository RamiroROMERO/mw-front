import { request } from '@/helpers/core';
import { formatDate, IntlMessages } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import React, { useEffect, useState } from 'react'

export const useContentHotel = ({ setLoading }) => {

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    date: '',
    type: 1
  });

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.table.availabilityDetails"),
    columns: [
      {
        text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '35%' },
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.ddbl"), dataField: "ddbl", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.king"), dataField: "king", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.kngm"), dataField: "kngm", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.adks"), dataField: "adks", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.adds"), dataField: "adds", headerStyle: { 'width': '10%' } },
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [],
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET(`hotel/process/calendarBooking`, (resp) => {
      const data = resp.data;
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  return (
    {
      table,
      formState,
      onInputChange,
    }
  )
}
