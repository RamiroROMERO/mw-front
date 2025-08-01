import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const SalesReports = React.lazy(() => import("@Views/app/billing/reports/salesReport"));
const CashReports = React.lazy(() => import("@Views/app/billing/reports/boxesReport"));
const BillingReports = React.lazy(() => import('@Views/app/billing/reports'));

const BillingReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BillingReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/salesReports"
      element={<SalesReports setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cashReports"
      element={<CashReports setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default BillingReportsRoutes;