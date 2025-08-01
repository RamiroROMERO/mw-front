import React from 'react'
import { Input } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { InputLabel } from '@/components/inputLabel/InputLabel'


export const SimpleSelect = ({ name, label, value, onChange, options, feedbackText = undefined, ...rest }) => {
  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <Input className='form-control'
        name={name}
        value={value}
        onChange={onChange}
        type="select"
        {...rest}
      >
        <option value='0'>{IntlMessages("msg.select")}</option>
        {options.map((item) => {
          return (<option value={item.id} key={item.id}>{item.name}</option>)
        })}
      </Input>
    </InputLabel>
  )
}
