import React from 'react'

export const XTd = ({ cellData, flexRender }) => {

  return (
    <td
      className={cellData.column.columnDef.classes ?? cellData.column.columnDef.classes}
      style={cellData.column.columnDef.style ?? cellData.column.columnDef.style}
    >
      {
        (cellData.column.columnDef.isIcon === true || cellData.column.columnDef.accessorKey === 'options' || cellData.column.columnDef.accessorKey === 'statusIcon') ? cellData.renderValue('Cell') :
          flexRender(
            cellData.column.columnDef.cell,
            cellData.getContext()
          )
      }
    </td>
  )
}
