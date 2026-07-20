import React from "react";
import { Route, Routes } from "react-router-dom"
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const ProductionProcess = React.lazy(() => import('@Views/app/production/process'));
const WorkOrders = React.lazy(() => import('@Views/app/production/process/workOrders'));
const ProjectDetail = React.lazy(() => import('@Views/app/production/process/workOrders/projectDetail'));
const Charges = React.lazy(() => import('@Views/app/production/process/charges'));

const ProductionProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<ProductionProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/workOrders"
      element={<WorkOrders setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/workOrders/projectDetail"
      element={<ProjectDetail setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/charges"
      element={<Charges setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default ProductionProcessRoutes;
