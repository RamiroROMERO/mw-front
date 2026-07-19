import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const AccountingSettings = React.lazy(() => import('@Views/app/accounting/settings'));
const LedgerAccounts = React.lazy(() => import('@Views/app/accounting/settings/ledgerAccounts'));
const TransactionConcepts = React.lazy(() => import('@Views/app/accounting/settings/transactionConcepts'));
const BudgetStructure = React.lazy(() => import('@Views/app/accounting/settings/budgetStructure'));
const IncomeStatement = React.lazy(() => import('@Views/app/accounting/settings/incomeStatement'));
const RecurringItems = React.lazy(() => import('@Views/app/accounting/settings/recurringItems'));

const AccountingSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<AccountingSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/ledgerAccounts"
      element={<LedgerAccounts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/transactionConcepts"
      element={<TransactionConcepts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/budgetStructure"
      element={<BudgetStructure setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/incomeStatements"
      element={<IncomeStatement setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/recurringItems"
      element={<RecurringItems setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default AccountingSettingsRoutes;