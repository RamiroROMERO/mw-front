import React from "react";
import { Route, Routes } from "react-router-dom"
import FA from "@/views//app/fixedAssets"
import { FASettingsRoutes } from "./FASettingsRoutes";
import { FAProcessRoutes } from "./FAProcessRoutes";
import { FAReportsRoutes } from "./FAReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const FARoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<FA {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<FAProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<FAReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<FASettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}