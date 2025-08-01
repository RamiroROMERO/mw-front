import React from 'react'
import { Button } from 'reactstrap';

const TableButtons = (props) => {
  const {color, icon, fnOnClick = undefined} = props;
  return (
    <Button
      color={`outline-${color}`}
      className={`btn-circle-table`}
      onClick={fnOnClick}
    >
      <i className={`bi bi-${icon}`} />
    </Button>
  )
}

export default TableButtons