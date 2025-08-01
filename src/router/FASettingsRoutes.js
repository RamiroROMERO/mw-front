import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const FASettings = React.lazy(() => import('@/views/app/fixedAssets/settings'));
const FixedAssetsSettingsTypes = React.lazy(() => import('@/views/app/fixedAssets/settings/types'));
const FixedAssetsSettingsAreas = React.lazy(() => import('@/views/app/fixedAssets/settings/areas'));
const FixedAssetsSettingsResponsibles = React.lazy(() => import('@/views/app/fixedAssets/settings/responsibles'));

const FASettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<FASettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/types"
      element={<FixedAssetsSettingsTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/areas"
      element={<FixedAssetsSettingsAreas setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/responsibles"
      element={<FixedAssetsSettingsResponsibles setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default FAReportsRoutes;