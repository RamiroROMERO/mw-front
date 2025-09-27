import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import notification from '@Containers/ui/Notifications';

export const useRoomMealTypes = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [dataMealTypes, setDataMealTypes] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const validation = {
    name: [(val) => val.length > 4, "msg.required.input.name"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
    status: true
  }, validation);

  const { id } = formState;

  const fnGetData = (page=currentPage, searchText=search) => {
    setLoading(true);
    request.GET(`hotel/settings/roomMealTypes/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      const pageTotal = resp.pagination.totalPages;
      setDataMealTypes(data);
      setTotalPages(pageTotal);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

    const fnClear = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(id) === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('hotel/settings/roomMealTypes', formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`hotel/settings/roomMealTypes/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`hotel/settings/roomMealTypes/${formState.id}`, data, () => {
        fnGetData();
        fnClear();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData(currentPage, search);
  }, [currentPage, search]);

  const propsToMsgDisable = {
    title: "alert.question.disable",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: () => onResetForm
  };

  const propsToDetail = {
    formState,
    formValidation,
    sendForm,
    onInputChange,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    dataMealTypes,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete,
    currentPage,
    totalPages,
    setCurrentPage,
    setSearch
  }

  return (
    {
      propsToDetail,
      propsToDetailTable,
      propsToMsgDisable
    }
  )
}
