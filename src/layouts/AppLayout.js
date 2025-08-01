import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { connect } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Topnav from '@Containers/navs/Topnav'
import Footer from '@Containers/navs/Footer'
import Sidebar from '@Containers/navs/Sidebar'

const AppLayout = ({ containerClassnames, children }) => {

  const currentUser = JSON.parse(localStorage.getItem('mw_current_user'));
  const { pathname, search } = useLocation();
  if (!currentUser) {
    return <Navigate to='/login' />
  }
  const lastPath = pathname + search;
  localStorage.setItem('mw_last_path', lastPath);

  return (
    <div id="app-container" className={containerClassnames}>
      <Topnav />
      <Sidebar />
      <main>
        <div className="container-fluid">{children ? children : <Outlet />}</div>
      </main>
      <Footer />
    </div>
  )
}

const mapStateToProps = ({ menu }) => {
  const { containerClassnames } = menu;
  return { containerClassnames };
};
const mapActionToProps = {};

const withRouter = (Component) => {
  const ComponentWithRouterProp = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return (
      <Component
        {...props}
        location={location}
        params={params}
        navigate={navigate}
      />
    );
  }
  return ComponentWithRouterProp;
}

export default withRouter(
  connect(mapStateToProps, mapActionToProps)(AppLayout)
);