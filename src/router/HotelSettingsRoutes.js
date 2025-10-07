import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));
const HotelSettings = React.lazy(() => import('@/views/app/hotelManagement/settings'));
const RoomsStatus = React.lazy(() => import('@/views/app/hotelManagement/settings/roomsStatus'));
const RoomsTypes = React.lazy(() => import('@/views/app/hotelManagement/settings/roomTypes'));
const RoomsLevels = React.lazy(() => import('@/views/app/hotelManagement/settings/roomLevels'));
const Services = React.lazy(() => import('@/views/app/hotelManagement/settings/services'));
const RoomMealTypes = React.lazy(() => import('@/views/app/hotelManagement/settings/roomMealTypes'));
const Rooms = React.lazy(() => import('@/views/app/hotelManagement/settings/rooms'));
const Tables = React.lazy(() => import('@/views/app/hotelManagement/settings/tables'));
const Materiales = React.lazy(() => import('@/views/app/hotelManagement/settings/materials'));
const Customers = React.lazy(() => import('@/views/app/hotelManagement/settings/customers'));
const BookingStatus = React.lazy(() => import('@/views/app/hotelManagement/settings/bookingStatus'));
const PaymentStatus = React.lazy(() => import('@/views/app/hotelManagement/settings/paymentStatus'));

const HotelSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<HotelSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/roomsStatus"
      element={<RoomsStatus setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/roomsTypes"
      element={<RoomsTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/roomsLevels"
      element={<RoomsLevels setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/services"
      element={<Services setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/roomMealTypes"
      element={<RoomMealTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/rooms"
      element={<Rooms setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/tables"
      element={<Tables setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/materials"
      element={<Materiales setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/customers"
      element={<Customers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/bookingStatus"
      element={<BookingStatus setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/paymentStatus"
      element={<PaymentStatus setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default HotelSettingsRoutes