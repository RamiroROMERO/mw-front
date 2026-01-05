import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { isAuthGuardActive } from '@/constants/defaultValues';
import { getCurrentUser } from './Utils';

const ProtectedRoute = ({
  component: Component,
  roles = undefined,
  ...rest
}) => {
  const setComponent = (props) => {
    if (isAuthGuardActive) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        if (roles) {
          if (roles.includes(currentUser.role)) {
            return <Outlet {...props} />;
          }
          return (
            <Navigate
              to='/unauthorized' />
          );
        }
        return <Outlet {...props} />;
      }
      return (
        <Navigate to='/login' />
      );
    }
    return <Outlet {...props} />;
  };

  return <Outlet />;
};

// eslint-disable-next-line import/prefer-default-export
export { ProtectedRoute };
