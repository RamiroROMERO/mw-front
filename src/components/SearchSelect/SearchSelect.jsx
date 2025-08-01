import React, { useEffect } from 'react'
import Select from 'react-select';
import {IntlMessages} from '@Helpers/Utils';
import CustomSelectInput from '@Components/common/CustomSelectInput';
import { InputLabel } from '@Components/inputLabel/InputLabel';

const SearchSelect = ({label='', name, inputValue=0, options, onChange, feedbackText=undefined, ...rest}) => {

  const onCustomChange = (e)=>{
    const value = e ? e.value : "0";
    onChange({target:{name, value}});
  };

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <Select
        components={{ Input: CustomSelectInput }}
        className="react-select"
        classNamePrefix="react-select"
        name={name}
        options={options}
        value={options.filter((elem) => {
          return elem.value === inputValue;
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