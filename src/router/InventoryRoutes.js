import React from "react";
import { Route, Routes } from "react-router-dom"
import Inventory from "@/views//app/inventory"
import { InventorySettingsRoutes } from "./InventorySettingsRoutes";
import { InventoryProcessRoutes } from "./InventoryProcessRoutes";
import { InventoryReportsRoutes } from "./InventoryReportsRoutes";
import PageNotFound from "@/views//pageNotFound";

export const InventoryRoutes = (props) => {
  const { setLoading } = props
  return <Routes>
    <Route
      index
      element={<Inventory {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} >
    </Route>
    <Route
      path={`/process/*`}
      element={<InventoryProcessRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/reports/*`}
      element={<InventoryReportsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/settings/*`}
      element={<InventorySettingsRoutes {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />} />
    <Route
      path={`/*`} element={<PageNotFound />} />
  </Routes >
}