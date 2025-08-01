import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const HRSettings = React.lazy(() => import('@/views/app/humanResources/settings'));
const DefaultValues = React.lazy(() => import('@/views/app/humanResources/settings/defaultValues'));
const JobPositions = React.lazy(() => import('@/views/app/humanResources/settings/jobpositions'));
const Schedules = React.lazy(() => import('@/views/app/humanResources/settings/schedules'));
const Areas = React.lazy(() => import('@/views/app/humanResources/settings/areas'));
const TaxCalculation = React.lazy(() => import('@/views/app/humanResources/settings/taxCalculation'));
const NeighborhoodTax = React.lazy(() => import('@/views/app/humanResources/settings/neighborhoodTax'));
const Overtime = React.lazy(() => import('@/views/app/humanResources/settings/overtime'));
const VacationSetting = React.lazy(() => import('@/views/app/humanResources/settings/vacations'));
const FaultTypes = React.lazy(() => import('@/views/app/humanResources/settings/faultTypes'));
const Biweeklys = React.lazy(() => import('@/views/app/humanResources/settings/biweeklys'));
const DeductionTypes = React.lazy(() => import('@/views/app/humanResources/settings/deductionTypes'));
const DaysTypes = React.lazy(() => import('@/views/app/humanResources/settings/daysTypes'));

export const HRSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HRSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/defaultValues"
      element={<DefaultValues setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/jobPositions"
      element={<JobPositions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/schedules"
      element={<Schedules setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/areas"
      element={<Areas setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/taxCalculation"
      element={<TaxCalculation setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/neighborhoodTax"
      element={<NeighborhoodTax setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/overtime"
      element={<Overtime setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/vacations"
      element={<VacationSetting setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/faultTypes"
      element={<FaultTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/biweeklys"
      element={<Biweeklys setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/deductionTypes"
      element={<DeductionTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/daysTypes"
      element={<DaysTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}