import React, { useState } from 'react'
import { ButtonDropdown, ButtonGroup, DropdownMenu, DropdownToggle } from 'reactstrap';
import { XReactTableActionButton } from './XReactTableActionButton';
import { XReactTableDropdownItem } from './XReactTableDropdownItem';

export const XReactTableActionButtons = ({ actionButtons, row }) => {
  const [nestingDropdownOpen, setNestingDropdownOpen] = useState(false);
  const visibleButtons = actionButtons.filter(button => !button.isFreeAction && !button.showInMenu);
  const menuButtons = actionButtons.filter(button => !button.isFreeAction && button.showInMenu)

  return (
    <ButtonGroup>
      {visibleButtons.map((button, idx) => (
        <XReactTableActionButton key={idx} buttonItem={button} row={row} />
      )
      )}
      {menuButtons.length > 0 && (
        <ButtonDropdown
          isOpen={nestingDropdownOpen}
          toggle={() => setNestingDropdownOpen(!nestingDropdownOpen)}
        >
          <DropdownToggle
            color='outline-info'
            className='btn btn-outline-info btn-circle-table'>
            <i className='bi bi-three-dots' />
          </DropdownToggle>
          <DropdownMenu right >
            {menuButtons.map((button, idx) => (<XReactTableDropdownItem key={idx} buttonItem={button} row={row} />)
            )}
          </DropdownMenu>
        </ButtonDropdown>

      )}

    </ButtonGroup>
  )
}
