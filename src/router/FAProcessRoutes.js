import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const FAProcess = React.lazy(() => import('@/views/app/fixedAssets/process'));
const FixedAssetsProcessRegister = React.lazy(() => import('@/views/app/fixedAssets/process/register'));


export const FAProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<FAProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/register"
      element={<FixedAssetsProcessRegister setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}