import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const BanksReports = React.lazy(() => import('@Views/app/banks/reports'));
const BanksBook = React.lazy(() => import('@Views/app/banks/reports/banksBook'));
const BankConciliation = React.lazy(() => import('@Views/app/banks/reports/bankConciliation'));
const BankReports = React.lazy(() => import('@Views/app/banks/reports/bankReports'));
const Payments = React.lazy(() => import('@Views/app/banks/reports/payments'));

const BanksReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BanksReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/banksBook"
      element={<BanksBook setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/bankConciliation"
      element={<BankConciliation setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/bankReports"
      element={<BankReports setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/Payments"
      element={<Payments setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default BanksReportsRoutes;