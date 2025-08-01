import React from "react";
import { Route, Routes } from "react-router-dom"
import Accounting from "@/views//app/accounting"
import { AccountingSettingsRoutes } from "./AccountingSettingsRoutes";
import { AccountingProcessRoutes } from "./AccountingProcessRoutes";
import { AccountingReportsRoutes } from "./AccountingReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const AccountingRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Accounting {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<AccountingProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<AccountingReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<AccountingSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}