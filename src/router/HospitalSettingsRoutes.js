import React from "react";
import { Route, Routes } from "react-router-dom";

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const HospitalSettings = React.lazy(() => import('@/views/app/hospitalManagement/settings'));
const GeneralSettings = React.lazy(() => import('@/views/app/hospitalManagement/settings/generalSettings'));
const Specialties = React.lazy(() => import('@/views/app/hospitalManagement/settings/specialties'));
const Specialists = React.lazy(() => import('@/views/app/hospitalManagement/settings/specialists'));
const AreasIncome = React.lazy(() => import('@/views/app/hospitalManagement/settings/areasIncome'));
const ReasonsAdmission = React.lazy(() => import("@/views/app/hospitalManagement/settings/reasonsAdmission"));
const Rooms = React.lazy(() => import("@/views/app/hospitalManagement/settings/rooms"));

export const HospitalSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HospitalSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/generalSettings"
      element={<GeneralSettings setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/specialties"
      element={<Specialties setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/specialists"
      element={<Specialists setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/areasIncome"
      element={<AreasIncome setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/reasonsAdmission"
      element={<ReasonsAdmission setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/rooms"
      element={<Rooms setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}
