import React from "react";
import { Route, Routes } from "react-router-dom"
import Tax from "@/views/app/taxes"
const TaxSettingsRoutes = React.lazy(() => import('@Router/TaxSettingsRoutes'));
const TaxProcessRoutes = React.lazy(() => import("@Router/TaxProcessRoutes"));
const TaxReportsRoutes = React.lazy(() => import("@Router/TaxReportsRoutes"));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const TaxRoutes = (props) => {
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

export default TaxRoutes;