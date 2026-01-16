import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const HotelProcess = React.lazy(() => import('@/views/app/hotelManagement/process'));
const Reservations = React.lazy(() => import('@/views/app/hotelManagement/process/reservations'));
const Quotes = React.lazy(() => import('@/views/app/hotelManagement/process/quotes'));
const RestaurantOrders = React.lazy(() => import('@/views/app/hotelManagement/process/restaurantOrders'));

const HotelProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HotelProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/reservations"
      element={<Reservations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/quotes"
      element={<Quotes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/restaurantOrders"
      element={<RestaurantOrders setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HotelProcessRoutes