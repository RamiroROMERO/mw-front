import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const BanksProcess = React.lazy(() => import('@/views/app/banks/process'));
const CheckRequest = React.lazy(() => import('@/views/app/banks/process/checkRequest'));
const Checks = React.lazy(() => import('@/views/app/banks/process/checks'));
const Transfers = React.lazy(() => import('@/views/app/banks/process/transfers'));
const TransBetweenAccounts = React.lazy(() => import('@/views/app/banks/process/transBetweenAccounts'));
const TransBetweenAffiliates = React.lazy(() => import('@/views/app/banks/process/transBetweenAffiliates'));
const CustomerDeposits = React.lazy(() => import('@/views/app/banks/process/customerDeposits'));
const VariousDeposits = React.lazy(() => import('@/views/app/banks/process/variousDeposits'));
const CashWithdrawal = React.lazy(() => import('@/views/app/banks/process/cashWithdrawal'));
const AffiliateDeposits = React.lazy(() => import('@/views/app/banks/process/affiliateDeposits'));
const DebCredNotes = React.lazy(() => import('@/views/app/banks/process/debCredNotes'));

export const BanksProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BanksProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/checkRequest"
      element={<CheckRequest setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/checks"
      element={<Checks setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/transBetweenAccounts"
      element={<TransBetweenAccounts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/transfers"
      element={<Transfers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cashWithdrawal"
      element={<CashWithdrawal setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/CustomerDeposits"
      element={<CustomerDeposits setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/variousDeposits"
      element={<VariousDeposits setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/transBetweenAffiliates"
      element={<TransBetweenAffiliates setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/affiliateDeposits"
      element={<AffiliateDeposits setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/debCredNotes"
      element={<DebCredNotes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}