
const ColumnCheckItem = ({label, name, value, onChange, ...rest}) => {

  return (
    <div
      className="form-check"
      style={{marginLeft:'5px'}}
      >
      <input
        className="form-check-input"
        type="checkbox"
        id={`dt-rt-chk-${name}`}
        name={`dt-rt-chk-${name}`}
        onClick={onChange}
        onChange={onChange}
        checked={value}
        // defaultChecked={false}
        {...rest}
        />
      {label && (<label className="form-check-label" htmlFor={`dt-rt-chk-${name}`}>
        {label}
      </label>)}
    </div>
    )
}

export default ColumnCheckItem