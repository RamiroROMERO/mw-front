import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const Dashboards = React.lazy(() => import("@Views/app/dashboards"));
const BillingSales = React.lazy(() => import("@Views/app/dashboards/billing/sales"));
const ProductCatalog = React.lazy(() => import('@Views/app/dashboards/productCatalog'));

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
      index
      path="/productCatalog"
      element={<ProductCatalog setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default DashboardsRoutes