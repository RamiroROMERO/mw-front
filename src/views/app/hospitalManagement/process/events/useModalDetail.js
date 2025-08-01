import React, { useEffect, useState } from 'react'
import { IntlMessages } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useModalDetail = ({ setLoading, currentItem }) => {
  const [openModalAddProduct, setOpenModalAddProduct] = useState(false);

  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("table.column.code"), dataField: "productCode", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { 'width': '55%' } },
      { text: IntlMessages("table.column.type"), dataField: "typeName", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.qty"), dataField: "quantity", headerStyle: { 'width': '15%' } }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: []
  });

  const fnGetDataDetail = () => {
    setLoading(true);
    request.GET(`hospital/process/eventDetails?fatherId=${currentItem.id}`, (resp) => {
      const data = resp.data.map((item) => {
        item.description = item.invProduct?.name || '';
        item.typeName = item.invProduct?.type === 1 ? 'Producto' : (item.invProduct?.type === 2 ? 'Servicio' : 'Materia Prima')
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  const fnAddProduct = () => {
    setOpenModalAddProduct(true);
  }

  const fnAddService = () => { }

  useEffect(() => {
    fnGetDataDetail();
  }, []);

  return (
    {
      table,
      fnAddProduct,
      fnAddService,
      openModalAddProduct,
      setOpenModalAddProduct,
      fnGetDataDetail
    }
  )
}
