import React from "react";
import { Route, Routes } from "react-router-dom"
const HR = React.lazy(() => import("@Views/app/humanResources"));
const HRSettingsRoutes = React.lazy(() => import('@Router/HRSettingsRoutes'));
const HRProcessRoutes = React.lazy(() => import('@Router/HRProcessRoutes'));
const HRReportsRoutes = React.lazy(() => import('@Router/HRReportsRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const HRRoutes = (props) => {
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

export default HRRoutes;