import React from "react";
import { Route, Routes } from "react-router-dom";

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const HospitalProcess = React.lazy(() => import('@Views/app/hospitalManagement/process'));
const PatientFiles = React.lazy(() => import('@Views/app/hospitalManagement/process/patientFiles'));
const Events = React.lazy(() => import("@Views/app/hospitalManagement/process/events"));
const Hospitalizations = React.lazy(() => import("@Views/app/hospitalManagement/process/hospitalizations"));
const ScheduledAppointments = React.lazy(() => import("@Views/app/hospitalManagement/process/scheduledAppointments"));

const HospitalProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HospitalProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/patientFiles"
      element={<PatientFiles setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/events"
      element={<Events setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/hospitalizations"
      element={<Hospitalizations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/scheduledAppointments"
      element={<ScheduledAppointments setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />}
    />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HospitalProcessRoutes;