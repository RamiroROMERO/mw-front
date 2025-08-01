import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const AccountingReports = React.lazy(() => import('@/views/app/accounting/reports'));
const ModuleAudit = React.lazy(() => import('@/views/app/accounting/reports/moduleAudit'));
const ModuleOpeningClosing = React.lazy(() => import('@/views/app/accounting/reports/moduleOpeningClosing'));
const AccountingClosures = React.lazy(() => import('@/views/app/accounting/reports/accountingClosures'));
const AccountingReport = React.lazy(() => import('@/views/app/accounting/reports/accountingReports'));

const AccountingReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<AccountingReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/moduleAudit"
      element={<ModuleAudit setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/moduleIO"
      element={<ModuleOpeningClosing setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountingClosures"
      element={<AccountingClosures setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountingReports"
      element={<AccountingReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default AccountingReportsRoutes;