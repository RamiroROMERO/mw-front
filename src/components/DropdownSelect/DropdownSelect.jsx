import React, { useState } from 'react'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { ItemCheck } from './ItemCheck';

const DropdownSelect = ({ tableInstance }) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret outline style={{ borderRadius: '0.1rem' }}>
        <i className="bi bi-layout-three-columns" />
      </DropdownToggle>
      <DropdownMenu>
        <ItemCheck
          label='Todas'
          checked={tableInstance.getIsAllColumnsVisible()}
          onChange={tableInstance.getToggleAllColumnsVisibilityHandler()}
        />
        {tableInstance.getAllLeafColumns().filter(column => column.columnDef.id !== 'btnActions').map(column => {
          return (
            <ItemCheck
              label={column.columnDef.text}
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />)
        })}
      </DropdownMenu>
    </Dropdown>
  )
}


export default DropdownSelect;