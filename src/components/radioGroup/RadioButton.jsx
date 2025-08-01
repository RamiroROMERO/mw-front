import React from 'react'
import { Input, Label } from 'reactstrap'
import { IntlMessages, validInt } from '@/helpers/Utils'

export const RadioButton = ({ id, name, label, value, onChange, divLength, ...rest }) => {

  return (
    <div className='custom-radio custom-control form-check'
      style={{ width: divLength }} >
      <Input
        className='form-check-input custom-control-input'
        type="radio"
        id={`${name}-${id}`}
        name={name}
        value={id}
        checked={validInt(value) === validInt(id)}
        onChange={onChange}
        onClick={onChange}
        {...rest}
      />
      {label && (<Label htmlFor={`${name}-${id}`}
        className='form-check-label custom-control-label'
      >
        {IntlMessages(label)}
      </Label>)}
    </div>
  )
}
