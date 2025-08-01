import React from "react";
import { Route, Routes } from "react-router-dom"
import PageNotFound from "@/views//pageNotFound";

const InventorySettings = React.lazy(() => import('@/views/app/inventory/settings'));
const Stores = React.lazy(() => import('@/views/app/inventory/settings/store'));
const MeasurementUnits = React.lazy(() => import('@/views/app/inventory/settings/measurementUnits'));
const ConversionFactors = React.lazy(() => import('@/views/app/inventory/settings/conversionFactors'));
const TypeProducts = React.lazy(() => import('@/views/app/inventory/settings/typeProducts'));
const ProductsCatalog = React.lazy(() => import('@/views/app/inventory/settings/productsCatalog'));
const StoresProducts = React.lazy(() => import('@/views/app/inventory/settings/storesProducts'));

export const InventorySettingsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<InventorySettings {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/store"
      element={<Stores setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/measurementUnits"
      element={<MeasurementUnits setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/conversionFactors"
      element={<ConversionFactors setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/typeProducts"
      element={<TypeProducts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/productsCatalog"
      element={<ProductsCatalog setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/storesProducts"
      element={<StoresProducts setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}