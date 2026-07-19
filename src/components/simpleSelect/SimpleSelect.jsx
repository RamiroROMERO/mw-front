import { Input } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { InputLabel } from '@Components/inputLabel/InputLabel'


// getOptionValue/getOptionLabel dejan consumir cualquier shape de opciones
// (ej. {value,label} como usa SearchSelect) sin tener que mapearlas primero
// a {id,name} — los defaults preservan el comportamiento de siempre, así
// que ningún call site existente necesita cambiar.
export const SimpleSelect = ({
  name,
  label,
  value,
  onChange,
  options,
  feedbackText = undefined,
  getOptionValue = (option) => option.id,
  getOptionLabel = (option) => option.name,
  ...rest
}) => {
  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <Input className='form-control'
        name={name}
        value={value}
        onChange={onChange}
        type="select"
        style={{ resize: "none", boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)" }}
        {...rest}
      >
        <option value='0'>{IntlMessages("msg.select")}</option>
        {options.map((item) => {
          const optionValue = getOptionValue(item);
          return (<option value={optionValue} key={optionValue}>{getOptionLabel(item)}</option>)
        })}
      </Input>
    </InputLabel>
  )
}
