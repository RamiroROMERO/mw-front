import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const PurchaseReportTax = React.lazy(() => import('@/views/app/taxes/reports/purchaseReport'));
const ProvidersCNReport = React.lazy(() => import('@/views/app/taxes/reports/providersCNReport'));
const ProvidersDNReport = React.lazy(() => import('@/views/app/taxes/reports/providersDNReport'));
const SalesReportTax = React.lazy(() => import('@/views/app/taxes/reports/salesReport'));
const RetentionReport = React.lazy(() => import('@/views/app/taxes/reports/retentionReport'));
const TaxReports = React.lazy(() => import('@/views/app/taxes/reports'));

const TaxReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<TaxReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/purchaseReport"
      element={<PurchaseReportTax setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/providersCNReport"
      element={<ProvidersCNReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/providersDNReport"
      element={<ProvidersDNReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/salesReport"
      element={<SalesReportTax setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/retentionReport"
      element={<RetentionReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default TaxReportsRoutes;