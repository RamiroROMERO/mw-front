import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const BanksReports = React.lazy(() => import('@/views/app/banks/reports'));
const BanksBook = React.lazy(() => import('@/views/app/banks/reports/banksBook'));
const BankConciliation = React.lazy(() => import('@/views/app/banks/reports/bankConciliation'));
const BankReports = React.lazy(() => import('@/views/app/banks/reports/bankReports'));
const Payments = React.lazy(() => import('@/views/app/banks/reports/payments'));

export const BanksReportsRoutes = (props) => {
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