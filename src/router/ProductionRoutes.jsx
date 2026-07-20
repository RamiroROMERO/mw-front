import React from "react";
import { Route, Routes } from "react-router-dom"
const Production = React.lazy(() => import("@Views/app/production"));
const ProductionSettingsRoutes = React.lazy(() => import('@Router/ProductionSettingsRoutes'));
const ProductionProcessRoutes = React.lazy(() => import('@Router/ProductionProcessRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const ProductionRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Production {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<ProductionProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<ProductionSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default ProductionRoutes;
