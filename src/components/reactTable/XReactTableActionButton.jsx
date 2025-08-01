import React from 'react'
import { Button } from 'reactstrap';

export const XReactTableActionButton = ({ buttonItem, row }) => {
  const { color, icon, toolTip, onClick } = buttonItem;
  return (
    <Button
      type="button"
      color={`outline-${color}`}
      className='btn-circle-table'
      data-bs-toggle="tooltip"
      data-bs-title={toolTip}
      onClick={() => { onClick(row.original) }}
    >
      <i className={`bi bi-${icon}`} />
    </Button>

  )
}
