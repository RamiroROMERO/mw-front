import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const Customers = React.lazy(() => import("@/views/app/billing/process/customers"));
const Invoicing = React.lazy(() => import("@/views/app/billing/process/invoicing"));
const PointSales = React.lazy(() => import("@/views/app/billing/process/pointSales"));
const CreditNotes = React.lazy(() => import("@/views/app/billing/process/custCreditNotes"));
const DebitNotes = React.lazy(() => import("@/views/app/billing/process/custDebitNotes"));

const BillingProcess = React.lazy(() =>
  import('@/views/app/billing/process')
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