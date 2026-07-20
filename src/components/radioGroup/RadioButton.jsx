import { Input, Label } from 'reactstrap'
import { IntlMessages, validInt } from '@Helpers/Utils'

export const RadioButton = ({ id, name, label, value, onChange, divLength, ...rest }) => {

  return (
    <div className='form-check'
      style={{ width: divLength }} >
      <Input
        className='form-check-input'
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
        className='form-check-label'
      >
        {IntlMessages(label)}
      </Label>)}
    </div>
  )
}
