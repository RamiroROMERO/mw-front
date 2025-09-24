import React, { useState, Suspense } from 'react'
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import AppLocale from './lang';
import { adminRoot } from '@Constants/defaultValues';
import { NotificationContainer } from '@Components/common/react-notifications';
const Loading = React.lazy(() => import('@Components/loading'));

const AppLayout = React.lazy(() => import('@Layouts/AppLayout'));
const AuthLayout = React.lazy(() => import('@Layouts/AuthLayout'));

const Home = React.lazy(() => import('@Views/home'));
const Login = React.lazy(() => import('@Views/authLogin'));
const ResetPassword = React.lazy(() => import('@Views/authResetPassword'));
const ForgotPassword = React.lazy(() => import('@Views/authForgotPassword'));
const PageError = React.lazy(() => import('@Views/pageError'));
const PageNotFound = React.lazy(() => import('@Views/pageNotFound'));

const BillingRoutes = React.lazy(() => import('@Router/BillingRoutes'));
const InventoryRoutes = React.lazy(() => import('@Router/InventoryRoutes'));
const AccountingRoutes = React.lazy(() => import('@Router/AccountingRoutes'));
const TaxRoutes = React.lazy(() => import('@Router/TaxRoutes'));
const BanksRoutes = React.lazy(() => import('@Router/BanksRoutes'));
const HRRoutes = React.lazy(() => import('@Router/HRRoutes'));
const FARoutes = React.lazy(() => import('@Router/FARoutes'));
const SettingsRoutes = React.lazy(() => import('@Router/SettingsRoutes'));
const HospitalRoutes = React.lazy(() => import('@Router/HospitalRoutes'));
const DashboardsRoutes = React.lazy(() => import('@Router/DashboardsRoutes'));
const HotelRoutes = React.lazy(() => import('@Router/HotelRoutes'));

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
                  path={`${adminRoot}/dashboards/*`}
                  element={<DashboardsRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
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
                <Route
                  path={`${adminRoot}/hotelManagement/*`}
                  element={<HotelRoutes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />

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