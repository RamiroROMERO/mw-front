import React from "react";
import { Route, Routes } from "react-router-dom"
const Hotel = React.lazy(() => import("@Views/app/hotelManagement"));
const HotelSettingsRoutes = React.lazy(() => import('@Router/HotelSettingsRoutes'));
const HotelProcessRoutes = React.lazy(() => import('@Router/HotelProcessRoutes'));
const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const HotelRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Hotel {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/settings/*`}
      element={<HotelSettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/process/*`}
      element={<HotelProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}

export default HotelRoutes