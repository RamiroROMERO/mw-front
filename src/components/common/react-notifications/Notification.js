/* eslint-disable react-@/hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Notification = ({
  type,
  title,
  message,
  customClassName,
  timeOut,
  onClick,
  onRequestHide
}) => {


  const defaultStyle = {
    transition: `opacity ${timeOut}ms ease-in-out`,
    opacity: 100,
  }

  const requestHide = () => {
    if (onRequestHide) {
      onRequestHide();
    }
  };

  useEffect(() => {
    let timer = null;
    if (timeOut !== 0) {
      timer = setTimeout(requestHide, timeOut);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    requestHide();
  };

  const className = classnames([
    'notification',
    `notification-${type}`,
    customClassName,
  ]);

  const listIcons = {
    'info': 'info-circle',
    'success': 'check-circle',
    'warning': 'exclamation-circle',
    'error': 'x-circle',
    'primary': 'info-circle',
    'secondary': 'info-circle',
  };

  const titleHtml = title ? <h4 className="title">{title}</h4> : null;
  return (
    <div className={`row ${className}`} onClick={() => handleClick()}>
      <div className="col-2">
        <i className={`notification-icon bi bi-${listIcons[type]}`} />
      </div>
      <div className="col-10">
        <div className="notification-message" role="alert">
          {titleHtml}
          <div className="message">{message}</div>
        </div>
      </div>
    </div>
  );
};

Notification.propTypes = {
  type: PropTypes.oneOf([
    'info',
    'success',
    'warning',
    'error',
    'primary',
    'secondary',
  ]),
  title: PropTypes.node,
  message: PropTypes.node,
  timeOut: PropTypes.number,
  onClick: PropTypes.func,
  onRequestHide: PropTypes.func,
  customClassName: PropTypes.string,
};

Notification.defaultProps = {
  type: 'info',
  title: null,
  message: null,
  timeOut: 5000,
  onClick: () => { },
  onRequestHide: () => { },
  customClassName: '',
};

export default Notification;
