import { Progress } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'

export const ProgressBar = ({ value = 0, color = 'primary', label = '', showValue = false, className = '' }) => {
  return (
    <div className={className}>
      {label && <span className="d-block mb-1">{IntlMessages(label)}</span>}
      <Progress color={color} value={value} style={{ height: '0.6rem' }}>
        {showValue ? `${value}%` : null}
      </Progress>
    </div>
  )
}
