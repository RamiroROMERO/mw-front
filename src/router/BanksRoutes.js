import React from "react";
import { Route, Routes } from "react-router-dom"
import Banks from "@/views//app/banks"
import { BanksSettingsRoutes } from "./BanksSettingsRoutes";
import { BanksProcessRoutes } from "./BanksProcessRoutes";
import { BanksReportsRoutes } from "./BanksReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const BanksRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Banks {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<BanksProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<BanksReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<BanksSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}