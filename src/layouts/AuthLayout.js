import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { adminRoot } from '@/constants/defaultValues';

const AuthLayout = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem('mw_current_user'));

  useEffect(() => {
    document.body.classList.add('background');
    document.body.classList.add('no-footer');

    return () => {
      document.body.classList.remove('background');
      document.body.classList.remove('no-footer');
    };
  }, []);

  if (currentUser) {
    return <Navigate to={adminRoot} />
  }

  return (
    <>
      <div className="fixed-background" />
      <main>
        <div className="container">{children ? children : <Outlet />}</div>
      </main>
    </>
  )
}

export default AuthLayout