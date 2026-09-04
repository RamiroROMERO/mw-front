import { IntlMessages } from '@Helpers/Utils'

export const SwitchToggle = ({ label, name, value, onChange, ...rest }) => {
  const genericId = `${name}-${Math.round(Math.random() * 100000, 0)}`
  return (
    <div className="form-check form-switch mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id={genericId}
        name={name}
        onChange={onChange}
        checked={value}
        {...rest}
      />
      {label && (<label className="form-check-label" htmlFor={genericId}>
        {IntlMessages(label)}
      </label>)}
    </div>
  )
}
