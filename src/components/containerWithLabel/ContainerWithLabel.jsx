import { IntlMessages } from '@/helpers/Utils'
import React from 'react'

export const ContainerWithLabel = ({ label, feedbackText = undefined, children }) => {
  return (
    <div className='container-with-label shadow-sm'>
      <span>{IntlMessages(label)}</span>
      {children}
      {feedbackText ? <div className='invalid-feedback'> {IntlMessages(feedbackText)} </div> : null}
    </div>
  )
}
