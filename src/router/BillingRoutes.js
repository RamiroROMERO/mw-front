import React from "react";
import { Route, Routes } from "react-router-dom"
const Billing = React.lazy(() => import("@Views/app/billing"));
const BillingSettingsRoutes = React.lazy(() => import("@Router/BillingSettingsRoutes"));
const BillingProcessRoutes = React.lazy(() => import("@Router/BillingProcessRoutes"));
const BillingReportsRoutes = React.lazy(() => import("@Router/BillingReportsRoutes"));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const BillingRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Billing {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<BillingProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<BillingReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<BillingSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default BillingRoutes;