import React from "react";
import { Route, Routes } from "react-router-dom"
import Tax from "@/views/app/taxes"
import { TaxSettingsRoutes } from "./TaxSettingsRoutes";
import { TaxProcessRoutes } from "./TaxProcessRoutes";
import { TaxReportsRoutes } from "./TaxReportsRoutes";
import PageNotFound from "@/views/pageNotFound";

export const TaxRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Tax {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<TaxProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<TaxReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<TaxSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}