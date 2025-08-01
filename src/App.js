import React, { useState, Suspense } from 'react'
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import AppLocale from './lang';
import { adminRoot } from './constants/defaultValues';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './views/home';
import Login from './views/authLogin';
import ResetPassword from './views/authResetPassword';
import Loading from './components/loading';
import ForgotPassword from './views/authForgotPassword';
import PageError from './views/pageError';
import PageNotFound from './views/pageNotFound';
import { NotificationContainer } from './components/common/react-notifications';
import { BillingRoutes } from './router/BillingRoutes';
import { InventoryRoutes } from './router/InventoryRoutes';
import { AccountingRoutes } from './router/AccountingRoutes';
import { TaxRoutes } from './router/TaxRoutes';
import { BanksRoutes } from './router/BanksRoutes';
import { HRRoutes } from './router/HRRoutes';
import { FARoutes } from './router/FARoutes';
import { SettingsRoutes } from './router/SettingsRoutes';
import { HospitalRoutes } from './router/HospitalRoutes';

// const Production = React.lazy(() => import('@/views/app/production'));
// const ProductionSettings = React.lazy(() => import('@/views/app/production/settings'));
// const OrdersTypes = React.lazy(() => import('@/views/app/production/settings/ordersTypes'));
// const Managers = React.lazy(() => import('@/views/app/production/settings/managers'));
// const Destinations = React.lazy(() => import('@/views/app/production/settings/destinations'));
// const ProductsTypes = React.lazy(() => import('@/views/app/production/settings/productsTypes'));
// const RawMaterial = React.lazy(() => import('@/views/app/production/settings/rawMaterial'));
// const ProductionProcess = React.lazy(() => import('@/views/app/production/process'));
// const WorkOrdersProd = React.lazy(() => import('@/views/app/production/process/workOrders'));
// const ProjectDetail = React.lazy(() => import('@/views/app/production/process/workOrders/projectDetail'));
// const Charges = React.lazy(() => import('@/views/app/production/process/charges')
// );

const App = (props) => {

  const { locale } = props;
  const currentAppLocale = AppLocale[locale];
  const [isLoading, setLoading] = useState(false);

  return (
    <>
      <IntlProvider
        locale={currentAppLocale.locale}
        messages={currentAppLocale.messages}
      >
        <Loading show={isLoading} />
        <NotificationContainer />
        <HashRouter>
          <Suspense fallback={<div className="loading" style={{ display: isLoading ? "block" : "none" }} />}>
            <Routes >
              <Route element={<AppLayout {...props} />}>
                {/* <Route index path='/' element={<Navigate to={`${adminRoot}/`} replace />} /> */}
                <Route
                  index path='/'
                  element={<Home {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/accounting/*`}
                  element={<AccountingRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/banks/*`}
                  element={<BanksRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/billing/*`}
                  element={<BillingRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/fixedAssets/*`}
                  element={<FARoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/humanResources/*`}
                  element={<HRRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/inventory/*`}
                  element={<InventoryRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/taxes/*`}
                  element={<TaxRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/hospitalManagement/*`}
                  element={<HospitalRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
                <Route
                  path={`${adminRoot}/settings/*`}
                  element={<SettingsRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />

                <Route path={`${adminRoot}/*`} element={<PageNotFound />} />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path='/login' element={<Login />} />
                <Route path='/resetPassword' element={<ResetPassword />} />
                <Route path='/forgotPassword' element={<ForgotPassword />} />
                <Route path='/*' element={<PageNotFound />} />
              </Route>
              <Route path='/*' element={<PageError />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </IntlProvider>
    </>
  );
}

const mapStateToProps = ({ authUser, settings }) => {
  const { currentUser } = authUser;
  const { locale } = settings;
  return { currentUser, locale, authUser };
};
const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(App);