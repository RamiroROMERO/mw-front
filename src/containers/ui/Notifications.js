/* eslint-disable no-alert */
import React from 'react';
import IntlMessages from '@/helpers/IntlMessages';
import { NotificationManager } from '@/components/common/react-notifications';


const createNotification = (type, title, message, className) => {
  const cName = className || '';
  switch (type) {
    case 'primary':
      NotificationManager.primary(
        <IntlMessages id={title} />,
        <IntlMessages id={message} />,
        3000,
        null,
        null,
        cName
      );
      break;
    case 'secondary':
      NotificationManager.secondary(
        <IntlMessages id={title} />,
        <IntlMessages id={message} />,
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
        <IntlMessages id={title} />,
        <IntlMessages id={message} />,
        3000,
        null,
        null,
        cName
      );
      break;
    case 'warning':
      NotificationManager.warning(
        <IntlMessages id={title} />,
        <IntlMessages id={message} />,
        3000,
        null,
        null,
        cName
      );
      break;
    case 'error':
      NotificationManager.error(
        <IntlMessages id={title} />,
        <IntlMessages id={message} />,
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