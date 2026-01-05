import { request } from '@/helpers/core';
import { IntlMessages, validInt } from '@/helpers/Utils';
import { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';

export const useCustomer = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listCountries, setListCountries] = useState([]);
  const [listCompanies, setListCompanies] = useState([]);
  const [listGenders, setListGenders] = useState([]);
  const [listTypeTax, setListTypeTax] = useState([]);

  const fnNewDocument = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem({});
    setOpenModalNew(true);
  }

  const fnEditDocument = (item) => {
    if (fnUpdate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem(item);
    setOpenModalNew(true);
  }

  const fnDisableDocument = (item) => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnConfirmDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`hotel/settings/customers/${currentItem.id}`, data, () => {
        fnGetData();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.rooms"),
    columns: [
      { text: IntlMessages("table.column.dni"), dataField: "dni", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.name"), dataField: "name", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("table.column.phone"), dataField: "phone1", headerStyle: { 'width': '15%' } },
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

  const fnGetData = () => {
    setLoading(true);
    request.GET(`hotel/settings/customers`, (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
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
    request.GET('admin/countries/getSl', (resp) => {
      const countries = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListCountries(countries);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    request.GET('rrhh/settings/genders/getSl', (resp) => {
      const genders = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListGenders(genders);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    request.GET('admin/taxTypes/getSl', (resp) => {
      const taxTypes = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListTypeTax(taxTypes);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    request.GET('hotel/settings/customers/getSl?typeId=1', (resp) => {
      const customer = resp.data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListCompanies(customer);
      setLoading(false);
    }, (err) => {

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
      listCountries,
      listCompanies,
      listGenders,
      listTypeTax,
      openModalNew,
      propsToMsgDisable,
      setOpenModalNew,
      fnGetData
    }
  )
}
