import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const Customers = React.lazy(() => import("@Views/app/billing/process/customers"));
const Invoicing = React.lazy(() => import("@Views/app/billing/process/invoicing"));
const PointSales = React.lazy(() => import("@Views/app/billing/process/pointSales"));
const CreditNotes = React.lazy(() => import("@Views/app/billing/process/custCreditNotes"));
const DebitNotes = React.lazy(() => import("@Views/app/billing/process/custDebitNotes"));
const Quotes = React.lazy(() => import("@Views/app/billing/process/quotes"));

const BillingProcess = React.lazy(() =>
  import('@Views/app/billing/process')
);

const BillingProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BillingProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/customers"
      element={<Customers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/quotes"
      element={<Quotes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/invoicing"
      element={<Invoicing setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/pointSales"
      element={<PointSales setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/custDebitNotes"
      element={<DebitNotes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/custCreditNotes"
      element={<CreditNotes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default BillingProcessRoutes;