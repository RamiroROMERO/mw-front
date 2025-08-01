import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const AccountingProcess = React.lazy(() => import('@/views/app/accounting/process'));
const WorkOrders = React.lazy(() => import('@/views/app/accounting/process/workOrders'));
const AccountsReceivable = React.lazy(() => import('@/views/app/accounting/process/accountsReceivable'));
const AccountsToPay = React.lazy(() => import('@/views/app/accounting/process/accountsToPay'));
const DailyItems = React.lazy(() => import('@/views/app/accounting/process/dailyItems'));
const DiaryBook = React.lazy(() => import('@/views/app/accounting/process/diaryBook'));
const Ledger = React.lazy(() => import('@/views/app/accounting/process/ledger'));
const CashFlow = React.lazy(() => import('@/views/app/accounting/process/cashFlow'));
const AdminExpenses = React.lazy(() => import('@/views/app/accounting/process/adminExpenses'));

export const AccountingProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<AccountingProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/workOrders"
      element={<WorkOrders setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountsReceivable"
      element={<AccountsReceivable setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountsToPay"
      element={<AccountsToPay setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/dailyItems"
      element={<DailyItems setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/diaryBook"
      element={<DiaryBook setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/ledger"
      element={<Ledger setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cashFlow"
      element={<CashFlow setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/adminExpenses"
      element={<AdminExpenses setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}