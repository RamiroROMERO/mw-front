import React from "react";
import { Route, Routes } from "react-router-dom"
import HR from "@/views//app/humanResources"
import { HRSettingsRoutes } from "./HRSettingsRoutes";
import { HRProcessRoutes } from "./HRProcessRoutes";
import { HRReportsRoutes } from "./HRReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const HRRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<HR {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<HRProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<HRReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<HRSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}