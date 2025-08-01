import React from 'react'
import { Input } from 'reactstrap'
import { InputLabel } from '@Components/inputLabel';

export const InputField = ({ name, label = "", value, onChange, type = "text", feedbackText = undefined, bold = false, ...rest }) => {
  return (
    <InputLabel label={label} feedbackText={feedbackText} bold={bold} >
      <Input
        bsSize="sm"
        value={value}
        id={name}
        name={name}
        onChange={onChange}
        type={type}
        style={{ resize: "none" }}
        className={bold ? 'font-weight-bold' : ''}
        {...rest}
      />
    </InputLabel>
  )
};
