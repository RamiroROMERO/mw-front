import React from 'react'
import { IntlMessages } from '@Helpers/Utils'

export const InputLabel = ({ label = "", feedbackText = undefined, bold=false, children }) => {
  return (
    <div className='form-group has-float-label'>
      {children}
      {label !== "" && (<span
        className={bold?'font-weight-bold':''}
      >
        {IntlMessages(label)}
      </span>)}
      {feedbackText && ( <div className="invalid-feedback d-block">{IntlMessages(feedbackText)}</div>) }
    </div>
  )
}
