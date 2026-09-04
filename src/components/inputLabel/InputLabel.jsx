import { useIntl } from 'react-intl'

export const InputLabel = ({ label = "", feedbackText = undefined, bold = false, children }) => {
  // useIntl() se llama siempre, sin condicionar — feedbackText/label pueden
  // pasar de vacío a string en la misma instancia montada (ej. al fallar una
  // validación), y llamar a IntlMessages() (que usa useIntl() por dentro)
  // solo quando hay texto violaba las Rules of Hooks (orden de hooks
  // inconsistente entre renders).
  const intl = useIntl()
  return (
    <div className='form-group has-float-label'>
      {children}
      {label !== "" && (<span
        className={bold ? 'fw-bold' : ''}
      >
        {intl.formatMessage({ id: label })}
      </span>)}
      {feedbackText && (<div className="invalid-feedback d-block">{intl.formatMessage({ id: feedbackText })}</div>)}
    </div>
  )
}
