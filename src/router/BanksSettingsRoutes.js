import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const BanksSettings = React.lazy(() => import('@/views/app/banks/settings'));
const BanksAccounts = React.lazy(() => import('@/views/app/banks/settings/banksAccounts'));
const Scheduling = React.lazy(() => import('@/views/app/banks/settings/scheduling'));

export const BanksSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<BanksSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/banksAccounts"
      element={<BanksAccounts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/scheduling"
      element={<Scheduling setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}