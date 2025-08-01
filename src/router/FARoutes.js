import React from "react";
import { Route, Routes } from "react-router-dom"
const FA = React.lazy(() => import("@Views/app/fixedAssets"));
const FASettingsRoutes = React.lazy(() => import('@Router/FASettingsRoutes'));
const FAProcessRoutes = React.lazy(() => import('@Router/FAProcessRoutes'));
const FAReportsRoutes = React.lazy(() => import('@Router/FAReportsRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const FARoutes = (props) => {
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

export default FARoutes;