import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const RetentionReceipt = React.lazy(() => import('@/views/app/taxes/process/retentionReceipt'));
const TaxProcess = React.lazy(() => import('@/views/app/taxes/process'));

const TaxProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<TaxProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/retentionReceipt"
      element={<RetentionReceipt setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default TaxProcessRoutes;