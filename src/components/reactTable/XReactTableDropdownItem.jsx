import React from 'react'
import { DropdownItem } from 'reactstrap';

export const XReactTableDropdownItem = ({ buttonItem, row }) => {

  const { icon, toolTip, onClick } = buttonItem;

  return (
    <DropdownItem
      onClick={() => {
        onClick(row.original);
      }}
    >
      <span>
        <i className={`bi bi-${icon}-fill`} /> {'  '}
        {toolTip}
      </span>
    </DropdownItem>
  )
}
