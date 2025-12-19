import moment from 'moment'
import { formatNumber } from '@/helpers/Utils'

const fieldTypes = ['date', 'number', 'currency']

export const SimpleTableTD = ({ value, formatTd }) => {

  let formatedValue = '', textAlign = 'left'
  const { type, format = '', prefix = '' } = formatTd

  if (!fieldTypes.includes(type)) {
    formatedValue = value;
  } else if (type == 'date' && format != '') {
    formatedValue = moment(value).format(format).toString();
  } else if (type == 'number') {
    textAlign = 'right';
    formatedValue = formatNumber(value, '', 2);
  }
  else if (type == 'currency') {
    textAlign = 'right';
    formatedValue = formatNumber(value, prefix, 2);
  }

  return (
    <td className={`text-${textAlign}`}>
      {formatedValue}
    </td>
  )
}
