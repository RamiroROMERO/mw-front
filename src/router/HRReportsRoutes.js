/* eslint-disable react/prop-types */
import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const HRReports = React.lazy(() => import('@/views/app/humanResources/reports'));
const InputOutputs = React.lazy(() => import('@/views/app/humanResources/reports/inputOutputs'));
const EmployeesByCust = React.lazy(() => import('@/views/app/humanResources/reports/employeesByCust'));
const ControlVacations = React.lazy(() => import('@/views/app/humanResources/reports/controlVacations'));
const PendingPayments = React.lazy(() => import('@/views/app/humanResources/reports/pendingPayments'));
const Salaries = React.lazy(() => import('@/views/app/humanResources/reports/salaries'));
const StaffDepartures = React.lazy(() => import('@/views/app/humanResources/reports/staffDepartures'));
const ProjectTransfers = React.lazy(() => import('@/views/app/humanResources/reports/projectTransfers'));

const HRReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HRReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/inputOutputs"
      element={<InputOutputs setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/employeesByCust"
      element={<EmployeesByCust setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/salaries"
      element={<Salaries setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/controlVacations"
      element={<ControlVacations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/pendingPayments"
      element={<PendingPayments setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/staffDepartures"
      element={<StaffDepartures setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/projectTransfers"
      element={<ProjectTransfers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HRReportsRoutes;