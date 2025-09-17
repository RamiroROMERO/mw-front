import React from 'react'

export const XTable = ({ children }) => {
  return (
    <div style={{overflowX: 'auto'}}>
      <table className="table table-bordered table-hover">
        {children}
      </table>
    </div>
  )
}
