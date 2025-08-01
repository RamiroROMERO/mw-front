import React from "react";
import { Route, Routes } from "react-router-dom"
const PageNotFound = React.lazy(() => import("@/views/pageNotFound"));

const InventoryProcess = React.lazy(() => import('@/views/app/inventory/process'));
const Providers = React.lazy(() => import('@/views/app/inventory/process/providers'));
const PurchaseOrders = React.lazy(() => import('@/views/app/inventory/process/purchaseOrders'));
const Purchases = React.lazy(() => import('@/views/app/inventory/process/purchases'));
const OtherPurchases = React.lazy(() => import('@/views/app/inventory/process/otherPurchases'));
const FuelPurchases = React.lazy(() => import('@/views/app/inventory/process/fuelPurchases'));
const TicketPurchase = React.lazy(() => import('@/views/app/inventory/process/ticketPurchase'));
const Stock = React.lazy(() => import('@/views/app/inventory/process/stock'));
const CreditNotesProv = React.lazy(() => import('@/views/app/inventory/process/creditNotesProv'));
const DebitNotesProv = React.lazy(() => import('@/views/app/inventory/process/debitNotesProv'));
const TransferToStores = React.lazy(() => import('@/views/app/inventory/process/transferToStores'));
const Requisitions = React.lazy(() => import('@/views/app/inventory/process/requisitions'));
const Refunds = React.lazy(() => import('@/views/app/inventory/process/refunds'));
const InventoryAdjustment = React.lazy(() => import('@/views/app/inventory/process/inventoryAdjustment'));
const ChangeCode = React.lazy(() => import('@/views/app/inventory/process/changeCode'));
const CostAdjustment = React.lazy(() => import('@/views/app/inventory/process/costAdjustment'));

const InventoryProcessRoutes = (props) => {
  const { setLoading } = props;
  return <Routes>
    <Route
      index
      element={<InventoryProcess {...props} setLoading={setLoading} match={{ isExact: true, params: {} }} />}
    />
    <Route
      index
      path="/providers"
      element={<Providers setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/purchaseOrders"
      element={<PurchaseOrders setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/purchases"
      element={<Purchases setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/otherPurchases"
      element={<OtherPurchases setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/fuelPurchases"
      element={<FuelPurchases setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/ticketPurchases"
      element={<TicketPurchase setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/stock"
      element={<Stock setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/debitNotesProv"
      element={<DebitNotesProv setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/creditNotesProv"
      element={<CreditNotesProv setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/transferToStores"
      element={<TransferToStores setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/requisitions"
      element={<Requisitions setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/refunds"
      element={<Refunds setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/inventoryAdjustments"
      element={<InventoryAdjustment setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/changeCode"
      element={<ChangeCode setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route
      index
      path="/costAdjustment"
      element={<CostAdjustment setLoading={setLoading} {...props} match={{ isExact: true, params: {} }} />} />
    <Route path={`/*`} element={<PageNotFound />} />
  </Routes>
}

export default InventoryProcessRoutes;