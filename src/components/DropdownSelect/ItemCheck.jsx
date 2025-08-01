import React from 'react'

export const ItemCheck = ({ name = 'itemCheck', label, checked, onChange }) => {
  const genericId = `${name}-${Math.round(Math.random() * 100000, 0)}`
  return (
    <div className="form-check custom-checkbox custom-control m-2">
      <input
        className="form-check-input custom-control-input"
        type="checkbox"
        id={genericId}
        onChange={onChange}
        checked={checked}
      />
      {label && (<label className="form-check-label custom-control-label" htmlFor={genericId}>
        {label}
      </label>)}
    </div>
  )
}
