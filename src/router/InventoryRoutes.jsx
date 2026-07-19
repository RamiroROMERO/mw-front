import React from "react";
import { Route, Routes } from "react-router-dom"
const Inventory = React.lazy(() => import("@Views/app/inventory"));
const InventorySettingsRoutes = React.lazy(() => import('@Router/InventorySettingsRoutes'));
const InventoryProcessRoutes = React.lazy(() => import('@Router/InventoryProcessRoutes'));
const InventoryReportsRoutes = React.lazy(() => import('@Router/InventoryReportsRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const InventoryRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Inventory {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<InventoryProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<InventoryReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<InventorySettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default InventoryRoutes;