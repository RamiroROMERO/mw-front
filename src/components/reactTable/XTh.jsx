import React from 'react'

export const XTh = ({ columnData, flexRender }) => {
  return (
    <th
      colSpan={columnData.colSpan}
      onClick={columnData.column.getToggleSortingHandler()}
      className={columnData.column.columnDef.headerClasses ?? columnData.column.columnDef.headerClasses}
      style={columnData.column.columnDef.headerStyle ?? columnData.column.columnDef.headerStyle}
    >
      {columnData.isPlaceholder
        ? null
        : flexRender(
          columnData.column.columnDef.header || columnData.column.columnDef.text,
          columnData.getContext()
        )}{
        { asc: " ↑", desc: " ↓" }[
        columnData.column.getIsSorted() ?? null
        ]
      }
    </th>
  )
}
