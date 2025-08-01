import React from 'react'
import XReactTableCheck from './XReactTableCheck';
import { XReactTableActionButtons } from './XReactTableActionButtons';
import { formatDate, formatNumber } from '@Helpers/Utils';

export const XReactTableColumns = ({ columns = [], enabledRowSelection = false, enabledActionButtons = false, actionButtons = [] }) => {

  let formatedColumns = [];
  columns = columns.map(column => {
    column.accessorKey = column.accessorKey || column.dataField
    column.header = column.header || column.text
    return column;
  });

  enabledRowSelection && formatedColumns.push(
    {
      id: "select",
      header: ({ table }) => (
        <XReactTableCheck
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <XReactTableCheck
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
    });

  const validatedColumns = columns.map(column => {
    if (column.type) {
      switch (column.type) {
        case 'number':
          column.style = column.style ? { ...column.style, textAlign: 'right' } : { textAlign: 'right' };
          column.cell = ({ row }) => (formatNumber(row.original[column.accessorKey], column.currencySign || '', column.decimals || 2))
          break;
        case 'date':
          column.cell = ({ row }) => (formatDate(row.original[column.accessorKey]))
          break;
        case 'boolean':
          column.style = column.style ? { ...column.style, textAlign: 'center' } : { textAlign: 'center' };
          column.cell = ({ row }) => ((row.original[column.accessorKey] === 1 || row.original[column.accessorKey] === true)
            ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />)
          break
        default:
          break;
      }
    }
    return column;
  })

  formatedColumns = [...formatedColumns, ...validatedColumns];
  if (enabledActionButtons) {
    formatedColumns = [...formatedColumns, {
      id: 'btnActions',
      header: 'Actions',
      headerStyle: { width: '15%' },
      cell: ({ row }) => (
        <XReactTableActionButtons row={row} actionButtons={actionButtons} />
      )
    }]

  }

  return formatedColumns;
}
