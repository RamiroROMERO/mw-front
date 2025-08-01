import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const BillingAreas = React.lazy(() => import("@/views/app/billing/settings/billingAreas"));
const CashBoxes = React.lazy(() => import("@/views/app/billing/settings/cashBoxes"));
const PaymentMethods = React.lazy(() => import("@/views/app/billing/settings/paymentMethods"));
const Discounts = React.lazy(() => import("@/views/app/billing/settings/discounts"));

const BillingSettings = React.lazy(() =>
  import('@/views/app/billing/settings')
);

export const BillingSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BillingSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/billingAreas"
      element={<BillingAreas setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/cashBoxes"
      element={<CashBoxes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/paymentMethods"
      element={<PaymentMethods setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/discounts"
      element={<Discounts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}