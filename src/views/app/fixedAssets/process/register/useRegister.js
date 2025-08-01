import React, { useState } from 'react'
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';
import { useEffect } from 'react';
import { IntlMessagesFn, validFloat, validInt } from '@/helpers/Utils';

export const useRegister = ({ setLoading }) => {

  const [sendForm, setSendForm] = useState(false)
  const [companyList, setCompanyList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);

  const validations = {
    companyId: [(val) => validInt(val) > 0, IntlMessagesFn("msg.required.select.companyId")],
    typeId: [(val) => validInt(val) > 0, IntlMessagesFn("msg.required.select.typeId")],
    areaId: [(val) => validInt(val) > 0, IntlMessagesFn("msg.required.select.areaId")],
    statusId: [(val) => validInt(val) > 0, IntlMessagesFn("msg.required.select.statusId")],
    name: [(val) => val.length > 10, IntlMessagesFn("msg.required.input.name")],
    dateIn: [(val) => val.length > 0, IntlMessagesFn("msg.required.input.dateIn")],
    dateBuy: [(val) => val.length > 10, IntlMessagesFn("msg.required.input.dateBuy")],
    valueIn: [(val) => validFloat(val) > 0, IntlMessagesFn("msg.required.input.valueIn")],
    valueBuy: [(val) => validFloat(val) > 0, IntlMessagesFn("msg.required.input.valueBuy")]
  };

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    companyId: 0,
    typeId: 0,
    areaId: 0,
    statusId: 0,
    code: "",
    name: "",
    trademark: "",
    model: "",
    serialNumber1: "",
    serialNumber2: "",
    dateBuy: "",
    dateIn: "",
    nameProv: "",
    invoiceNumber: "",
    valueBuy: 0.00,
    valueIn: 0.00,
    description: "",
    notes: "",
    status: 0,
  }, validations);

  const fnGetData = () => {

    request.GET("admin/companies/getSL", resp => {
      const { data } = resp;
      const listData = data.map(elem => {
        const newItem = {
          id: elem.id,
          name: elem.name
        };
        return newItem;
      });
      console.log(listData);
      setCompanyList(listData);
    }, err => {
      console.log(err);
    });

    request.GET("fixedAssets/settings/types", resp => {
      const { data } = resp;
      const listData = data.map(elem => {
        const newItem = {
          id: elem.id,
          name: elem.name
        };
        return newItem;
      });
      setTypeList(listData);
    }, err => {
      console.log(err);
    });
    request.GET("fixedAssets/settings/areas", resp => {
      const { data } = resp;
      const listData = data.map(elem => {
        const newItem = {
          id: elem.id,
          name: elem.name
        };
        return newItem;
      });
      setAreaList(listData);
    }, err => {
      console.log(err);
    });
    request.GET("fixedAssets/settings/statuses", resp => {
      const { data } = resp;
      const listData = data.map(elem => {
        const newItem = {
          id: elem.id,
          name: elem.name
        };
        return newItem;
      });
      setStatusList(listData)
    }, err => {
      console.log(err);
    });

  }

  const fnNewDocument = () => {
    onResetForm();
  };
  const fnSearchDocument = () => {

    setLoading(true);
    request.GET('fixedAssets/process/fixedAssets', resp => {
      setLoading(false);
      const { data } = resp;
      setTableList(data);
      setOpenSearch(false);
    }, err => {
      setLoading(false);
      console.log(err);
    })

  }

  const fnSaveDocument = () => {

  }

  const fnPrintDocument = () => {

  }

  const fnDeleteDocument = () => {

  }

  const fnDelete = () => {

  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      // {
      //   title: "button.ledgerAccounts",
      //   icon: "bi bi-journal-text",
      //   onClick: fnLedgerAccounts
      // },
      // {
      //   title: "button.export",
      //   icon: "bi bi-file-earmark-excel",
      //   onClick: fnExportToExcel
      // }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    fnGetData();
  }, [])


  return {
    propsToControlPanel,
    formState,
    formValidation,
    onInputChange,
    onBulkForm,
    sendForm,
    lists: {
      companyList, areaList, typeList, statusList, tableList
    },
    openSearch,
    setOpenSearch
  }
}
