import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { formatDate } from '@Helpers/Utils';

export const useHotelRoomInventory = ({ setLoading }) => {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [table, setTable] = useState({
    columns: [],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [],
  });

  useEffect(() => {
    let initDate = new Date().toJSON().substring(0, 10);
    setLoading(true);
    request.GET(`hotel/dashboard/getRoomInventory?startDate=${initDate}&endDate=${initDate}`, ({ data }) => {
      setLoading(false);
      const { fields } = data;
      let columns = []
      columns = fields.map(item => {
        const currCol = { 'text': item, dataField: item, headerStyle: { 'width': '10%' } }
        return currCol;
      });
      setTable({ ...table, columns });
    }, err => {
      console.log(err);
      setLoading(false);
    });
  }, []);

  const fnViewButton = () => {
    setLoading(true);
    request.GET(`hotel/dashboard/getRoomInventory?startDate=${startDate}&endDate=${endDate}`, ({ data }) => {
      setLoading(false);
      let { data: dataForTable, fields } = data;
      const columns = fields.map(item => {
        const currCol = { 'text': item, dataField: item, headerStyle: { 'width': '10%' } }
        return currCol;
      });
      dataForTable = dataForTable.map(item => {
        item.Date = formatDate(item.Date);
        return item;
      });
      setTable({ ...table, columns: [...columns], data: dataForTable });
    }, err => {
      console.log(err);
      setLoading(false);
    });
  }


  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    table,
    fnViewButton
  }
}
