import React from "react";
import { Route, Routes } from "react-router-dom"
const Settings = React.lazy(() => import("@Views/app/settings"));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const Format = React.lazy(() => import("@Views/app/Format"));

const BillingInternalDocuments = React.lazy(() => import('@/views/app/settings/internalDocuments'));
const BillingTaxDocuments = React.lazy(() => import('@/views/app/settings/taxDocuments'));
const CompanyInformation = React.lazy(() => import('@/views/app/settings/companyInformation'));
const Currency = React.lazy(() => import('@/views/app/settings/currency'));
const ProviderTypes = React.lazy(() => import('@/views/app/settings/providerTypes'));
const CustomerTypes = React.lazy(() => import('@/views/app/settings/customerTypes'));
const Intercompanies = React.lazy(() => import('@/views/app/settings/intercompanies'));
const UserAccounts = React.lazy(() => import('@/views/app/settings/userAccounts'));
const Users = React.lazy(() => import('@/views/app/settings/userAccounts/users'));
const UserProfile = React.lazy(() => import('@/views/app/settings/userAccounts/users/userProfile'));
const Modules = React.lazy(() => import('@/views/app/settings/userAccounts/modules'));

const SettingsRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Settings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/userAccounts`}
      element={<UserAccounts {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/userAccounts/users`}
      element={<Users {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/userAccounts/users/userProfile`}
      element={<UserProfile {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/userAccounts/modules`}
      element={<Modules {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/taxDocuments`}
      element={<BillingTaxDocuments {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/internalDocuments`}
      element={<BillingInternalDocuments {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/companyInformation`}
      element={<CompanyInformation {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/currency`}
      element={<Currency {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/providerTypes`}
      element={<ProviderTypes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/customerTypes`}
      element={<CustomerTypes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/intercompanies`}
      element={<Intercompanies {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/format`}
      element={<Format {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default SettingsRoutes;