import React from 'react'
import { IntlMessages } from '@Helpers/Utils'

export const Checkbox = ({label, name, value, onChange, ...rest}) => {
  const genericId = `${name}-${Math.round(Math.random()*100000,0)}`
  return (
    <div className="form-check custom-checkbox custom-control mb-3">
      <input 
        className="form-check-input custom-control-input"
        type="checkbox"
        id={genericId}
        name={name}
        // onClick={onChange}
        onChange={onChange}
        defaultValue={value}
        // value={value}
        checked={value}
        {...rest}
        />
      {label && (<label className="form-check-label custom-control-label" htmlFor={genericId}>
        {IntlMessages(label)}
      </label>)}
    </div>
  )
}
