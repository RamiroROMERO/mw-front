import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const FiscalPeriods = React.lazy(() => import('@/views/app/taxes/settings/fiscalPeriods'));
const TypesTaxes = React.lazy(() => import('@/views/app/taxes/settings/typesTaxes'));
const TypesRetention = React.lazy(() => import('@/views/app/taxes/settings/typesRetention'));
const TaxSettings = React.lazy(() => import('@/views/app/taxes/settings'));

export const TaxSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<TaxSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/fiscalPeriods"
      element={<FiscalPeriods setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/typeTaxes"
      element={<TypesTaxes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/typeRetentions"
      element={<TypesRetention setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}