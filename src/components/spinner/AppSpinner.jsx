import { Spinner } from 'reactstrap'
import { getCurrentColor } from '@Helpers/Utils';

export const AppSpinner = ({ size = "sm", className = "" }) => {
  const currentColor = getCurrentColor();
  const color = currentColor.split('.')[0] === 'dark' ? "light" : "primary";
  return (
    <Spinner size={size} color={color} className={className} />
  )
}
