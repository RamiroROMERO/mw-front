import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const SalesReports = React.lazy(() => import("@Views/app/billing/reports/salesReport"));
const GeneralInvoice = React.lazy(() => import("@Views/app/billing/reports/generalInvoice"));
const SummaryByProduct = React.lazy(() => import("@Views/app/billing/reports/summaryByProduct"));
const SalesBySalesperson = React.lazy(() => import("@Views/app/billing/reports/salesBySalesperson"));
const MonthlySalesCustomer = React.lazy(() => import("@Views/app/billing/reports/monthlySalesCustomer"));
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
      path="/generalInvoice"
      element={<GeneralInvoice setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/summaryByProduct"
      element={<SummaryByProduct setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/salesBySalesperson"
      element={<SalesBySalesperson setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/monthlySalesCustomer"
      element={<MonthlySalesCustomer setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cashReports"
      element={<CashReports setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default BillingReportsRoutes;