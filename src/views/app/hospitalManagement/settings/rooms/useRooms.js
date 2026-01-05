import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { IntlMessages, validInt } from '@/helpers/Utils';

export const useRooms = ({ setLoading }) => {
  const [idRecord, setIdRecord] = useState(0);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const fnGetData = () => {
    setLoading(true);
    request.GET('hospital/settings/rooms', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnEditDocument = (item) => {
    setCurrentItem(item);
  }

  const fnDeleteDocument = (item) => {
    setIdRecord(item.id);
    setOpenMsgQuestion(true);
  }

  const fnOkDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(idRecord) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`hospital/settings/rooms/${idRecord}`, (resp) => {
      setLoading(false);
      setIdRecord(0);
      fnGetData();
    }, (err) => {
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.hospitalManagement.rooms"),
    columns: [
      { text: IntlMessages("input.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '70%' } },
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

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDelete,
    fnOnNo: () => { setIdRecord(0) }
  };

  return (
    {
      table,
      currentItem,
      setCurrentItem,
      fnGetData,
      propsToMsgDelete
    }
  )
}
