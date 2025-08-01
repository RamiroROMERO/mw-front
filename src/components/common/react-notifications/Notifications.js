/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import classnames from 'classnames';
import Notification from './Notification';
import './cssTransition.css';

const Notifications = ({ notifications = [], enterTimeout, leaveTimeout, onRequestHide }) => {

  const nodeRef = useRef(null);
  const handleRequestHide = (notification) => {
    if (onRequestHide) {
      onRequestHide(notification);
    }
  };

  const className = classnames('notification-container', {
    'notification-container-empty': notifications.length === 0,
  });

  return (
    <div className={className}>
      <TransitionGroup>
        {notifications && notifications.map((notification) => {
          const key = notification.id || new Date().getTime();
          return (
            <CSSTransition
              nodeRef={nodeRef}
              classNames="notification"
              timeout={{ enter: enterTimeout, exit: leaveTimeout }}
              unmountOnExit
            >
              <Notification
                key={key}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                timeOut={notification.timeOut}
                onClick={notification.onClick}
                icon={notification.icon || null}
                onRequestHide={() => { handleRequestHide(notification) }}
                customClassName={notification.customClassName}
              />
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
}

Notifications.propTypes = {
  notifications: PropTypes.array,
  onRequestHide: PropTypes.func,
  enterTimeout: PropTypes.number,
  leaveTimeout: PropTypes.number,
};

Notifications.defaultProps = {
  notifications: [],
  onRequestHide: () => { },
  enterTimeout: 400,
  leaveTimeout: 400,
};
export default Notifications;
