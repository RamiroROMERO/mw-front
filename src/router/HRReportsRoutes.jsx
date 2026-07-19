/* eslint-disable react/prop-types */
import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));
const HRReports = React.lazy(() => import('@Views/app/humanResources/reports'));
const InputOutputs = React.lazy(() => import('@Views/app/humanResources/reports/inputOutputs'));
const EmployeesByCust = React.lazy(() => import('@Views/app/humanResources/reports/employeesByCust'));
const ControlVacations = React.lazy(() => import('@Views/app/humanResources/reports/controlVacations'));
const ControlPermissions = React.lazy(() => import('@Views/app/humanResources/reports/controlPermissions'));
const ControlAbsences = React.lazy(() => import('@Views/app/humanResources/reports/controlAbsences'));
const ControlIncapacities = React.lazy(() => import('@Views/app/humanResources/reports/controlIncapacities'));
const GeneralVacations = React.lazy(() => import('@Views/app/humanResources/reports/generalVacations'));
const PendingPayments = React.lazy(() => import('@Views/app/humanResources/reports/pendingPayments'));
const Salaries = React.lazy(() => import('@Views/app/humanResources/reports/salaries'));
const StaffDepartures = React.lazy(() => import('@Views/app/humanResources/reports/staffDepartures'));
const ProjectTransfers = React.lazy(() => import('@Views/app/humanResources/reports/projectTransfers'));
const BiweeklyIncomes = React.lazy(() => import('@Views/app/humanResources/reports/biweeklyIncomes'));
const NewStaff = React.lazy(() => import('@Views/app/humanResources/reports/newStaff'));
const PaymentsHistory = React.lazy(() => import('@Views/app/humanResources/reports/paymentsHistory'));
const PendingBenefits = React.lazy(() => import('@Views/app/humanResources/reports/pendingBenefits'));
const BirthdaysMonth = React.lazy(() => import('@Views/app/humanResources/reports/birthdaysMonth'));

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
      path="/controlPermissions"
      element={<ControlPermissions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/controlAbsences"
      element={<ControlAbsences setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/controlIncapacities"
      element={<ControlIncapacities setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/generalVacations"
      element={<GeneralVacations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/pendingPayments"
      element={<PendingPayments setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/pendingBenefits"
      element={<PendingBenefits setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/staffDepartures"
      element={<StaffDepartures setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/projectTransfers"
      element={<ProjectTransfers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/biweeklyIncomes"
      element={<BiweeklyIncomes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/newStaff"
      element={<NewStaff setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/paymentsHistory"
      element={<PaymentsHistory setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/birthdaysMonth"
      element={<BirthdaysMonth setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HRReportsRoutes;