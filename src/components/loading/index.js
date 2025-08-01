import React from 'react'
import { Spinner } from 'reactstrap'
import { getCurrentColor } from '@/helpers/Utils';

const Loading = ({ show }) => {
  const currentColor = getCurrentColor();
  return (
    <>{
      show ?
        <div id="loading-backdrop">
          {/* <div className="loading" /> */}
          <Spinner
            color={currentColor.split('.')[0] === 'dark' ? "light" : "success"}
          // size=""
          > </Spinner>
        </div>
        : null
    }</>
  )
}

export default Loading
