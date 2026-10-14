/* eslint-disable no-alert */
import IntlMessages from '@Helpers/IntlMessages';
import { NotificationManager } from '@Components/common/react-notifications';


// title y message son ids de traducción; un objeto { text } se muestra tal cual (mensajes que
// vienen del back, ya redactados). El texto conserva sus saltos de línea (el detalle campo por campo
// de un validation.error trae uno por línea); los ids de traducción no cambian.
const toNode = (value) => (
  value && typeof value === 'object' && value.text !== undefined
    ? <span style={{ whiteSpace: 'pre-line' }}>{value.text}</span>
    : <IntlMessages id={value} />
);

const createNotification = (type, title, message, className) => {
  const cName = className || '';
  switch (type) {
    case 'primary':
      NotificationManager.primary(
        toNode(title),
        toNode(message),
        3000,
        null,
        null,
        cName
      );
      break;
    case 'secondary':
      NotificationManager.secondary(
        toNode(title),
        toNode(message),
        3000,
        null,
        null,
        cName
      );
      break;
    case 'info':
      NotificationManager.info(title, message, 3000, null, null, cName);
      break;
    case 'success':
      NotificationManager.success(
        toNode(title),
        toNode(message),
        3000,
        null,
        null,
        cName
      );
      break;
    case 'warning':
      NotificationManager.warning(
        toNode(title),
        toNode(message),
        3000,
        null,
        null,
        cName
      );
      break;
    case 'error':
      NotificationManager.error(
        toNode(title),
        toNode(message),
        5000,
        null,
        null,
        cName
      );
      break;
    default:
      NotificationManager.info('Info message');
      break;
  }
};

export default createNotification;