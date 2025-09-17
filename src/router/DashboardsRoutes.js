import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const Dashboards = React.lazy(() => import("@Views/app/dashboards"));
const BillingSales = React.lazy(() => import("@/views/app/dashboards/billing/sales"));

const DashboardsRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Dashboards {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      index
      path="/billingSales"
      element={<BillingSales setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default DashboardsRoutes