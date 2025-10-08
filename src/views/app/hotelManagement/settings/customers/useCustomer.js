import { request } from '@/helpers/core';
import { IntlMessages, validInt } from '@/helpers/Utils';
import { useEffect, useState } from 'react'

export const useCustomer = ({ setLoading }) => {
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listDepartments, setListDepartments] = useState([]);
  const [listMunicipalities, setListMunicipalities] = useState([]);

  const fnNewDocument = () => {
    setCurrentItem({});
    setOpenModalNew(true);
  }

  const fnEditDocument = (item) => {
    setCurrentItem(item);
    setOpenModalNew(true);
  }

  const fnDisableDocument = (item) => {
    // if (fnDelete === false) {
    //   notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
    //   return;
    // }
    setCurrentItem({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnConfirmDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`facCustomers/${currentItem.id}`, data, () => {
        fnGetData();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.rooms"),
    columns: [
      { text: IntlMessages("table.column.dni"), dataField: "rtn", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.name"), dataField: "nomcli", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("table.column.phone"), dataField: "tel", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.email"), dataField: "email", headerStyle: { 'width': '15%' } },
      {
        text: IntlMessages("table.column.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options',
    },
    actions: [{
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDisableDocument,
      icon: 'x-circle'
    }, {
      color: "primary",
      icon: "bi bi-plus",
      onClick: fnNewDocument,
      title: IntlMessages("button.new"),
      isFreeAction: true
    }],
  });

  const fnGetData = ()=>{
    setLoading(true);
    request.GET(`facCustomers`, (resp)=>{
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {

    request.GET('admin/locateDeptos/getSL', resp => {
      const listDeptos = resp.data.map(item => {
        return {
          label: item.name,
          value: item.code
        }
      });
      setListDepartments(listDeptos);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });

    fnGetData();
  }, []);

  const propsToMsgDisable = {
    title: "alert.question.disable",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDisableDocument,
    fnOnNo: () => setCurrentItem({})
  };

  return (
    {
      table,
      currentItem,
      listDepartments,
      listMunicipalities,
      openModalNew,
      propsToMsgDisable,
      setOpenModalNew,
      setListMunicipalities,
      fnGetData
    }
  )
}
