import { useState } from 'react'
import { InputGroup, InputGroupText, Input } from 'reactstrap'
import { InputLabel } from '@Components/inputLabel'

const formatter = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const CurrencyInput = ({ name, label = "", value, onChange, symbol = "$", feedbackText = undefined, ...rest }) => {
  const [focused, setFocused] = useState(false)

  const displayValue = focused
    ? (value ?? '')
    : (value !== undefined && value !== null && value !== '' ? formatter.format(value) : '')

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, '')
    onChange?.(raw === '' ? '' : Number(raw))
  }

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <InputGroup size="sm">
        <InputGroupText>{symbol}</InputGroupText>
        <Input
          bsSize="sm"
          type="text"
          inputMode="decimal"
          id={name}
          name={name}
          value={displayValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          style={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)" }}
          {...rest}
        />
      </InputGroup>
    </InputLabel>
  )
}
