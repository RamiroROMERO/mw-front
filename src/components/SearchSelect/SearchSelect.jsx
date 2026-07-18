import { useEffect } from 'react'
import Select from 'react-select';
import { IntlMessages } from '@Helpers/Utils';
import CustomSelectInput from '@Components/common/CustomSelectInput';
import { InputLabel } from '@Components/inputLabel/InputLabel';

// getOptionValue/getOptionLabel dejan consumir cualquier shape de opciones
// (ej. {id,name} tal cual viene del backend) sin tener que mapearlas primero
// a {value,label} — los defaults preservan el comportamiento de siempre, así
// que ningún call site existente necesita cambiar.
const SearchSelect = ({
  label = '',
  name,
  inputValue = 0,
  options,
  onChange,
  feedbackText = undefined,
  getOptionValue = (option) => option.value,
  getOptionLabel = (option) => option.label,
  ...rest
}) => {

  const onCustomChange = (e) => {
    const value = e ? getOptionValue(e) : "0";
    onChange({ target: { name, value } });
  };

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <Select
        components={{ Input: CustomSelectInput }}
        className="react-select"
        classNamePrefix="react-select"
        name={name}
        options={options}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        value={options.filter((elem) => {
          return getOptionValue(elem) === inputValue;
        })}
        onChange={onCustomChange}
        placeholder={IntlMessages("msg.select")}
        isClearable
        {...rest}
      />
    </InputLabel>
  )
}

export default SearchSelect;