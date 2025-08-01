import React from 'react';
import { Route, Routes } from "react-router-dom";
import HospitalManagement from '@/views//app/hospitalManagement';
import PageNotFound from "@/views//pageNotFound";
import { HospitalSettingsRoutes } from './HospitalSettingsRoutes';
import { HospitalProcessRoutes } from './HospitalProcessRoutes';

export const HospitalRoutes = (props) => {
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
