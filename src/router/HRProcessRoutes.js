import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const HRProcess = React.lazy(() => import('@/views/app/humanResources/process'));
const Employees = React.lazy(() => import('@/views/app/humanResources/process/employees'));
const PrintCarnet = React.lazy(() => import('@/views/app/humanResources/process/printCarnet'));
const Permissions = React.lazy(() => import('@/views/app/humanResources/process/permissions'));
const Vacations = React.lazy(() => import('@/views/app/humanResources/process/vacations'));
const Accidents = React.lazy(() => import('@/views/app/humanResources/process/accidents'));
const Incapacities = React.lazy(() => import('@/views/app/humanResources/process/incapacities'));
const Admonitions = React.lazy(() => import('@/views/app/humanResources/process/admonitions'));
const ProofWork = React.lazy(() => import('@/views/app/humanResources/process/proofWork'));
const Projects = React.lazy(() => import('@/views/app/humanResources/process/projects'));
const DailyReport = React.lazy(() => import('@/views/app/humanResources/process/dailyReport'));
const DailyPayroll = React.lazy(() => import('@/views/app/humanResources/process/dailyPayroll'));
const SeventhDay = React.lazy(() => import('@/views/app/humanResources/process/seventhDay'));
const Deductions = React.lazy(() => import('@/views/app/humanResources/process/deductions'));
const ResumePayroll = React.lazy(() => import('@/views/app/humanResources/process/resumePayroll'));
const BiweeklyPayroll = React.lazy(() => import('@/views/app/humanResources/process/biweeklyPayroll'));
const PaymentPlans = React.lazy(() => import('@/views/app/humanResources/process/paymentPlans'));
const DeductionBiweekly = React.lazy(() => import('@/views/app/humanResources/process/deductionBiweekly'));
const ThirteenthMonth = React.lazy(() => import('@/views/app/humanResources/process/thirteenthMonth'));
const FourteenthMonth = React.lazy(() => import('@/views/app/humanResources/process/fourteenthMonth'));
const VacationPayroll = React.lazy(() => import('@/views/app/humanResources/process/vacationPayroll'));
const NeighborhoodTaxPayroll = React.lazy(() => import('@/views/app/humanResources/process/neighborhoodTax'));
const AttendanceControl = React.lazy(() => import('@/views/app/humanResources/process/attendanceControl'));
const Incomes = React.lazy(() => import('@/views/app/humanResources/process/incomes'));

const HRProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HRProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/employees"
      element={<Employees setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/printCarnet"
      element={<PrintCarnet setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/permissions"
      element={<Permissions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/vacations"
      element={<Vacations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/accidents"
      element={<Accidents setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/incapacities"
      element={<Incapacities setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/admonitions"
      element={<Admonitions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/proofWork"
      element={<ProofWork setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/projects"
      element={<Projects setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/dailyReport"
      element={<DailyReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/dailyPayroll"
      element={<DailyPayroll setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/seventhDay"
      element={<SeventhDay setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/deductions"
      element={<Deductions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/seventhDay"
      element={<SeventhDay setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/resumePayroll"
      element={<ResumePayroll setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/biweeklyPayroll"
      element={<BiweeklyPayroll setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/paymentPlans"
      element={<PaymentPlans setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/deductionBiweekly"
      element={<DeductionBiweekly setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/thirteenthMonth"
      element={<ThirteenthMonth setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/fourteenthMonth"
      element={<FourteenthMonth setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/vacationPayroll"
      element={<VacationPayroll setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/neighborhoodTaxPayroll"
      element={<NeighborhoodTaxPayroll setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/attendanceControl"
      element={<AttendanceControl setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/incomes"
      element={<Incomes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HRProcessRoutes;