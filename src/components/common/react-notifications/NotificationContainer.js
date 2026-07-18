/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import NotificationManager from './NotificationManager';
import Notifications from './Notifications';

const NotificationContainer = ({ enterTimeout = 400, leaveTimeout = 400 }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    NotificationManager.addChangeListener(setNotifications);
    return () => {
      NotificationManager.removeChangeListener(setNotifications);
    };
  }, []);

  const handleRequestHide = (notification) => {
    NotificationManager.remove(notification);
  };

  return (
    <Notifications
      enterTimeout={enterTimeout}
      leaveTimeout={leaveTimeout}
      notifications={notifications}
      onRequestHide={handleRequestHide}
    />
  );
};

export default NotificationContainer;
