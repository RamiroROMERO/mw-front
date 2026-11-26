import { IntlMessages, IntlMessagesFn } from '@Helpers/Utils'
import { RadioButton } from './RadioButton'

export const RadioGroup = ({ label, name, value, onChange, options = [], feedbackText = undefined, display = 'block' }) => {
  let lengths = []
  for (let a = 0; a < options.length; a++) {
    lengths[a] = IntlMessagesFn(options[a].label).length;
  }
  lengths = lengths.sort((a, b) => { return a - b });
  // Ancho de cada opción en horizontal: el botón y su espacio (~45px) más el texto más largo (~9px por letra), con un mínimo para etiquetas cortas como Sí/No (antes 15px por letra: con 2 letras eran 30px y las opciones se montaban).
  const maxlength = Math.max((lengths[lengths.length - 1] || 0) * 9 + 45, 90);
  return (
    <>
      <div className={`shadow-sm ${feedbackText ? 'div-label-border mb-1' : 'div-label-border'}`}>
        {label && (<span>
          {IntlMessages(label)}
        </span>)}
        <div style={{ justifyContent: 'flex-start', display: display === 'block' ? 'block' : 'flex', flexWrap: 'wrap' }}>
          {options.map((elem, key) => {
            return (<RadioButton
              key={key}
              id={elem.id}
              name={name}
              value={value}
              onChange={onChange}
              label={elem.label}
              disabled={elem.disabled}
              divLength={`${maxlength}px`}
            />)
          })}
        </div>
      </div>
      {/* {feedbackText ?? <div className="invalid-feedback d-block">{feedbackText ? IntlMessages(feedbackText) : ""}</div>} */}
    </>
  )
}
