import React from "react";
import { Route, Routes } from "react-router-dom";

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const HospitalSettings = React.lazy(() => import('@Views/app/hospitalManagement/settings'));
const GeneralSettings = React.lazy(() => import('@Views/app/hospitalManagement/settings/generalSettings'));
const Specialties = React.lazy(() => import('@Views/app/hospitalManagement/settings/specialties'));
const Specialists = React.lazy(() => import('@Views/app/hospitalManagement/settings/specialists'));
const AreasIncome = React.lazy(() => import('@Views/app/hospitalManagement/settings/areasIncome'));
const ReasonsAdmission = React.lazy(() => import("@Views/app/hospitalManagement/settings/reasonsAdmission"));
const Rooms = React.lazy(() => import("@Views/app/hospitalManagement/settings/rooms"));

const HospitalSettingsRoutes = (props) => {
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

export default HospitalSettingsRoutes;