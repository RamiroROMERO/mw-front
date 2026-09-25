import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const AccountingReports = React.lazy(() => import('@Views/app/accounting/reports'));
const ModuleAudit = React.lazy(() => import('@Views/app/accounting/reports/moduleAudit'));
const ModuleOpeningClosing = React.lazy(() => import('@Views/app/accounting/reports/moduleOpeningClosing'));
const AccountingClosures = React.lazy(() => import('@Views/app/accounting/reports/accountingClosures'));
const AccountingReport = React.lazy(() => import('@Views/app/accounting/reports/accountingReports'));
const OtherReceivableReports = React.lazy(() => import('@Views/app/accounting/reports/otherReceivableReports'));
const CxCWeekly = React.lazy(() => import('@Views/app/accounting/reports/cxcWeekly'));
const CxCPaymentHistory = React.lazy(() => import('@Views/app/accounting/reports/cxcPaymentHistory'));
const CxCInvoiceTrace = React.lazy(() => import('@Views/app/accounting/reports/cxcInvoiceTrace'));
const CxCProjection = React.lazy(() => import('@Views/app/accounting/reports/cxcProjection'));
const CxCByInsurer = React.lazy(() => import('@Views/app/accounting/reports/cxcByInsurer'));
const CxPInvoiceTrace = React.lazy(() => import('@Views/app/accounting/reports/cxpInvoiceTrace'));
const CxPProviderHistory = React.lazy(() => import('@Views/app/accounting/reports/cxpProviderHistory'));
const CxPCashInvoices = React.lazy(() => import('@Views/app/accounting/reports/cxpCashInvoices'));
const CxPPeriodSummary = React.lazy(() => import('@Views/app/accounting/reports/cxpPeriodSummary'));
const CxPProjection = React.lazy(() => import('@Views/app/accounting/reports/cxpProjection'));
const IncomeStatementReport = React.lazy(() => import('@Views/app/accounting/reports/incomeStatementReport'));
const BalanceGeneral = React.lazy(() => import('@Views/app/accounting/reports/balanceGeneral'));
const TrialBalance = React.lazy(() => import('@Views/app/accounting/reports/trialBalance'));
const BudgetExecution = React.lazy(() => import('@Views/app/accounting/reports/budgetExecution'));
const CxPPaymentHistory = React.lazy(() => import('@Views/app/accounting/reports/cxpPaymentHistory'));

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
      path="/moduleOpeningClosing"
      element={<ModuleOpeningClosing setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountingClosures"
      element={<AccountingClosures setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accountingReports"
      element={<AccountingReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/otherReceivableReports"
      element={<OtherReceivableReports setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxcWeekly"
      element={<CxCWeekly setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxcPaymentHistory"
      element={<CxCPaymentHistory setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxcInvoiceTrace"
      element={<CxCInvoiceTrace setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxcProjection"
      element={<CxCProjection setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxcByInsurer"
      element={<CxCByInsurer setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpInvoiceTrace"
      element={<CxPInvoiceTrace setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpProviderHistory"
      element={<CxPProviderHistory setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpCashInvoices"
      element={<CxPCashInvoices setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpPeriodSummary"
      element={<CxPPeriodSummary setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpProjection"
      element={<CxPProjection setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/incomeStatementReport"
      element={<IncomeStatementReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/balanceGeneral"
      element={<BalanceGeneral setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/trialBalance"
      element={<TrialBalance setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/budgetExecution"
      element={<BudgetExecution setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cxpPaymentHistory"
      element={<CxPPaymentHistory setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default AccountingReportsRoutes;