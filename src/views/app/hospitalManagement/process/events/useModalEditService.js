import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';

export const useModalEditService = ({ setLoading, currentItem }) => {
  const [openModalProvider, setOpenModalProvider] = useState(false);
  const [currentProviderItem, setCurrentProviderItem] = useState({});
  const [idRecordToDelete, setIdRecordToDelete] = useState(0);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.qty"), dataField: "quantity", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.price"), dataField: "price", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("input.hospValue"), dataField: "hospValue", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("input.provValue"), dataField: "provValue", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': '10%' } }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [
      {
        color: 'warning',
        icon: 'pencil',
        onClick: (item) => {
          setCurrentProviderItem(item);
          setOpenModalProvider(true);
        },
        toolTip: IntlMessages("button.edit")
      },
      {
        color: 'danger',
        icon: 'trash',
        onClick: (item) => {
          setIdRecordToDelete(item.id);
          setOpenMsgQuestion(true);
        },
        toolTip: IntlMessages("button.delete")
      },
      {
        color: 'primary',
        icon: 'plus',
        onClick: () => {
          setCurrentProviderItem({ id: 0, fatherId: currentItem.id, providerId: 0, quantity: 1, price: 0, discPercent: 0, taxPercent: 0, hospPercent: 0, provPercent: 0 });
          setOpenModalProvider(true);
        },
        title: IntlMessages("button.add"),
        isFreeAction: true
      }
    ]
  });

  const fnGetProviders = () => {
    setLoading(true);
    request.GET(buildUrl('hospital/process/eventDetailsProviders', { fatherId: currentItem.id }), (resp) => {
      const data = resp.data.map((item) => {
        item.providerName = item.provider?.name || '';
        return item;
      });
      setTable((prevTable) => ({ ...prevTable, data }));
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnOkDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(idRecordToDelete) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`hospital/process/eventDetailsProviders/${idRecordToDelete}`, (resp) => {
      setLoading(false);
      setIdRecordToDelete(0);
      fnGetProviders();
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetProviders();
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDelete,
    fnOnNo: () => { setIdRecordToDelete(0) }
  };

  return {
    table,
    openModalProvider,
    setOpenModalProvider,
    currentProviderItem,
    propsToMsgDelete,
    fnGetProviders
  }
}
