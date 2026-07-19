import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const RetentionReceipt = React.lazy(() => import('@Views/app/taxes/process/retentionReceipt'));
const TaxProcess = React.lazy(() => import('@Views/app/taxes/process'));

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