import React from "react";
import { Route, Routes } from "react-router-dom";

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const HonorariosReport = React.lazy(() => import('@Views/app/hospitalManagement/reports/honorariosReport'));

const HospitalReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      path="/honorariosReport"
      element={<HonorariosReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HospitalReportsRoutes;
