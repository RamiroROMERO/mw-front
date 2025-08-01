import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const FAReports = React.lazy(() =>
  import('@/views/app/fixedAssets/reports')
);

export const FAReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<FAReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}