import React from "react";
import { Route, Routes } from "react-router-dom"
import Billing from "@/views//app/billing"
import { BillingSettingsRoutes } from "./BillingSettingsRoutes";
import { BillingProcessRoutes } from "./BillingProcessRoutes";
import { BillingReportsRoutes } from "./BillingReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const BillingRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Billing {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<BillingProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<BillingReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<BillingSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}