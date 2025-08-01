import React from "react";
import { Route, Routes } from "react-router-dom"

const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const InventoryReports = React.lazy(() => import('@/views/app/inventory/reports'));
const PurchaseReport = React.lazy(() => import('@/views/app/inventory/reports/purchaseReport'));
const InventoryReport = React.lazy(() => import('@/views/app/inventory/reports/inventoryReport'));
const PurchaseMemo = React.lazy(() => import('@/views/app/inventory/reports/purchaseMemo'));
const InventoryMemo = React.lazy(() => import('@/views/app/inventory/reports/inventoryMemo'));

const InventoryReportsRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<InventoryReports {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/purchaseReport"
      element={<PurchaseReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/inventoryReport"
      element={<InventoryReport setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/purchaseMemo"
      element={<PurchaseMemo setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/inventoryMemo"
      element={<InventoryMemo setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default InventoryReportsRoutes;