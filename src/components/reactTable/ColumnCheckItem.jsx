import React from 'react'

const ColumnCheckItem = ({label, name, value, onChange, ...rest}) => {

  return (
    <div 
      className="form-check custom-checkbox custom-control"
      style={{marginLeft:'5px'}}
      >
      <input 
        className="form-check-input custom-control-input"
        type="checkbox"
        id={`dt-rt-chk-${name}`}
        name={`dt-rt-chk-${name}`}
        onClick={onChange}
        onChange={onChange}
        checked={value}
        // defaultChecked={false}
        {...rest}
        />
      {label && (<label className="form-check-label custom-control-label" htmlFor={`dt-rt-chk-${name}`}>
        {label}
      </label>)}
    </div>
    )
}

export default ColumnCheckItem