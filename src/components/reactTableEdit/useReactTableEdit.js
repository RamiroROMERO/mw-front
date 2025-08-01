import React, { useState, useEffect } from 'react'
import { validInt } from '@/helpers/Utils';

export const useReactTableEdit = ({ columns, data, onChangeData, options }) => {

  const [valueSearch, setValueSearch] = useState('');
  const [dataSearch, setDataSearch] = useState(data);

  let nameColumns = []
  let editableColumns = [];
  let styleColumns = [];
  const { tableHeight, columnActions, multiSelected, onMultiSelected } = options;
  columns.map(elem => {
    nameColumns = [...nameColumns, elem.field];
    editableColumns = [...editableColumns, elem.isEditable ? elem.isEditable : false];
    styleColumns = [...styleColumns, elem.bodyStyle ? elem.bodyStyle : null];
    return nameColumns;
  });

  const onSearchData = ({ target }) => {
    const { value } = target;
    setValueSearch(value);
    if (value === "") {
      setDataSearch(data);
    } else {
      const newData = data.filter(elem => {
        let exist = false
        Object.keys(elem).map(item => {
          if (elem[item].toString().toLowerCase().includes(value.toLowerCase())) {
            exist = true;
          }
          return exist;
        });
        return exist;
      });
      setDataSearch(newData);
    }
  };

  const handleChange = ({ target }) => {
    const { id, name, value } = target;
    const currentId = validInt(id.split('-')[1]);
    const changeData = data.map(elem => {
      if (validInt(elem.id) === currentId) {
        elem[name] = value;
      }
      return elem;
    });

    if (onChangeData) onChangeData(changeData);
  }

  useEffect(() => {
    setDataSearch(data);
  }, [data])


  return {
    valueSearch, dataSearch, onSearchData, handleChange, nameColumns, editableColumns, styleColumns, tableHeight
  }
}
