import React from "react";
import { Route, Routes } from "react-router-dom"
const Banks = React.lazy(() => import("@/views//app/banks"));
const BanksSettingsRoutes = React.lazy(() => import('@Router/BanksSettingsRoutes'));
const BanksProcessRoutes = React.lazy(() => import('@Router/BanksProcessRoutes'));
const BanksReportsRoutes = React.lazy(() => import('@Router/BanksReportsRoutes'));
const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const BanksRoutes = (props) => {
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

export default BanksRoutes;