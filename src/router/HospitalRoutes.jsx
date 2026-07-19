import React from 'react';
import { Route, Routes } from "react-router-dom";

const HospitalSettingsRoutes = React.lazy(() => import('@Router/HospitalSettingsRoutes'));
const HospitalProcessRoutes = React.lazy(() => import('@Router/HospitalProcessRoutes'));

const HospitalManagement = React.lazy(() => import('@Views/app/hospitalManagement'));
const PageNotFound = React.lazy(() => import('@Views/pageNotFound'));

const HospitalRoutes = (props) => {
  const { setLoading } = props
  return (
    <Routes>
      <Route
        index
        element={<HospitalManagement {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
      </Route>
      <Route
        path={`/settings/*`}
        element={<HospitalSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
      />
      <Route
        path={`/process/*`}
        element={<HospitalProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
      />
      <Route path={`/*`} element={<PageNotFound />} />
    </Routes >
  )
}

export default HospitalRoutes;