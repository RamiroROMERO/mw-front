import React from "react";
import { Route, Routes } from "react-router-dom"
const Accounting = React.lazy(() => import("@Views/app/accounting"));
const AccountingSettingsRoutes = React.lazy(() => import('@Router/AccountingSettingsRoutes'));
const AccountingProcessRoutes = React.lazy(() => import('@Router/AccountingProcessRoutes'));
const AccountingReportsRoutes = React.lazy(() => import('@Router/AccountingReportsRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const AccountingRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Accounting {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<AccountingProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<AccountingReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<AccountingSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default AccountingRoutes;