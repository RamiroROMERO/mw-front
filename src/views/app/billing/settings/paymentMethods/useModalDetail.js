import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms'
import React, { useEffect, useState } from 'react'

const formValidations = {
  description: [(val) => val.length !== 0, "msg.required.input.description"],
  idCtaCont: [val => val.length !== 0, "msg.required.select.contAccount"],
};

export const useModalDetail = ({ setLoading, selectedItem }) => {

  const [sendForm, setSendForm] = useState(false);
  const [contCtasList, setContCtasList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [currentItemDetail, setCurrentItemDetail] = useState({});
  const [msgQuestionDeleteDetail, setMsgQuestionDeleteDetail] = useState(false);

  console.log(selectedItem);

  const { formState, formValidation, onInputChange, onBulkForm, onResetForm, isFormValid } = useForm({
    id: 0,
    idFather: selectedItem || 0,
    description: '',
    idCtaCont: '',
    percentComiss: 0,
    idCtaComiss: '',
    isReceivable: false,
    customerId: 0,
    status: true
  }, formValidations);

  const fnEditDetail = (item) => {
    onBulkForm(item)
    setCurrentItemDetail(item);
    setSendForm(false);
  };
  const fnDeleteDetail = (item) => {
    setCurrentItemDetail(item);
    onBulkForm(item);
    setMsgQuestionDeleteDetail(true);
  }

  const fnNewDetail = () => {
    onResetForm();
    setSendForm(false);
    setCurrentItemDetail({});
  }

  const fnSaveDetail = () => {

    setSendForm(true);

    if (!isFormValid) return;

    if (validInt(formState.id) === 0) {
      formState.idFather = selectedItem;
      request.POST('billing/settings/paymentMethodsDetail', formState, res => {
        fnGetTableData();
        fnNewDetail();
      }, err => {
      });
    } else {
      request.PUT(`billing/settings/paymentMethodsDetail/${formState.id}`, formState, res => {
        fnGetTableData();
        fnNewDetail();
      }, err => { })
    }

  }


  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("page.paymentMethods.table.name"), dataField: "description", headerStyle: { 'width': '75%' } },
    ],
    data: detailData,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditDetail
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteDetail
    }]
  })

  const fnGetInitialData = () => {

    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccount = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setContCtasList(listAccount);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('billing/settings/customers/findSL', res => {
      const { data } = res;
      setCustomerList(data.map(item => {
        return {
          label: `${item.nomcli}`,
          value: item.id
        }
      }));
    }, err => { fnNewDetail() });
  }

  const fnGetTableData = () => {
    request.GET(`billing/settings/paymentMethodsDetail?idFather=${selectedItem}`, res => {
      const { data } = res;
      setDetailData(data);

      setTable({ ...table, data })

    }, err => {
      fnNewDetail();

    })
  }

  const fnDelete = () => {
    if (validInt(currentItemDetail.id) === 0) return;

    request.DELETE(`billing/settings/paymentMethodsDetail/${formState.id}`, res => {
      fnGetTableData()
      fnNewDetail();
    }, err => {
      fnNewDetail()
    })
    setMsgQuestionDeleteDetail(false);
  }

  useEffect(() => {
    fnGetInitialData();
    fnGetTableData();
  }, [])

  const propsToMsgDeleteDetail = { open: msgQuestionDeleteDetail, setOpen: setMsgQuestionDeleteDetail, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem: setCurrentItemDetail }

  return {
    formState,
    formValidation,
    onInputChange,
    sendForm,
    contCtasList,
    customerList,
    table,
    fnSaveDetail,
    fnNewDetail,
    isFormValid,
    propsToMsgDeleteDetail
  }
}
