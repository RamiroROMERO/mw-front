import React from 'react'
import { IntlMessages, IntlMessagesFn } from '@Helpers/Utils'
import { RadioButton } from './RadioButton'

export const RadioGroup = ({ label, name, value, onChange, options = [], feedbackText = undefined, display = 'block' }) => {
  let lengths = []
  for (let a = 0; a < options.length; a++) {
    lengths[a] = IntlMessagesFn(options[a].label).length;
  }
  lengths = lengths.sort((a, b) => { return a - b });
  const maxlength = lengths[lengths.length - 1] * 15;
  return (
    <>
      <div className={feedbackText ? 'div-label-border mb-1' : 'div-label-border'}>
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
