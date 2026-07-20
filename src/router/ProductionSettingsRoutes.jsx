import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@Views/pageNotFound"));

const ProductionSettings = React.lazy(() => import('@Views/app/production/settings'));
const Customers = React.lazy(() => import('@Views/app/billing/process/customers'));
const Managers = React.lazy(() => import('@Views/app/production/settings/managers'));
const OrdersTypes = React.lazy(() => import('@Views/app/production/settings/ordersTypes'));
const ProductsTypes = React.lazy(() => import('@Views/app/production/settings/productsTypes'));
const Destinations = React.lazy(() => import('@Views/app/production/settings/destinations'));
const RawMaterial = React.lazy(() => import('@Views/app/production/settings/rawMaterial'));

const ProductionSettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<ProductionSettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/customers"
      element={<Customers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/managers"
      element={<Managers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/ordersTypes"
      element={<OrdersTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/productsTypes"
      element={<ProductsTypes setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/destinations"
      element={<Destinations setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/rawMaterial"
      element={<RawMaterial setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default ProductionSettingsRoutes;
