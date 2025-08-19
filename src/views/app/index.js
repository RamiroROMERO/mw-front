import React, { Suspense, useState } from 'react';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import AppLayout from 'layout/AppLayout';
import Loading from '@/components/loading';
// import { ProtectedRoute, UserRole } from '@/helpers/authHelper';

const Gogo = React.lazy(() =>
  import('./start')
);
const SecondMenu = React.lazy(() =>
  import('./second-menu')
);
const BlankPage = React.lazy(() =>
  import('./blank-page')
);

const Production = React.lazy(() =>
  import('./production')
);

const ProductionSettings = React.lazy(() =>
  import('./production/settings')
);

const OrdersTypes = React.lazy(() =>
  import('./production/settings/ordersTypes')
);

const Managers = React.lazy(() =>
  import('./production/settings/managers')
);

const Destinations = React.lazy(() =>
  import('./production/settings/destinations')
);

const ProductsTypes = React.lazy(() =>
  import('./production/settings/productsTypes')
);

const RawMaterial = React.lazy(() =>
  import('./production/settings/rawMaterial')
);

const ProductionProcess = React.lazy(() =>
  import('./production/process')
);

const WorkOrdersProd = React.lazy(() =>
  import('./production/process/workOrders')
);

const ProjectDetail = React.lazy(() =>
  import('./production/process/workOrders/projectDetail')
);

const Charges = React.lazy(() =>
  import('./production/process/charges')
);

const Billing = React.lazy(() =>
  import('./billing')
);

const BillingSettings = React.lazy(() =>
  import('./billing/settings')
);

const BillingAreas = React.lazy(() =>
  import('./billing/settings/billingAreas')
);

const CashBoxes = React.lazy(() =>
  import('./billing/settings/cashBoxes')
);

const PaymentMethods = React.lazy(() =>
  import('./billing/settings/paymentMethods')
);

const Discounts = React.lazy(() =>
  import('./billing/settings/discounts')
);

const BillingProcess = React.lazy(() =>
  import('./billing/process')
);

const Customers = React.lazy(() =>
  import('./billing/process/customers')
);

const Invoicing = React.lazy(() =>
  import('./billing/process/invoicing')
);

const PointSales = React.lazy(() =>
  import('./billing/process/pointSales')
);

const CustDebitNotes = React.lazy(() =>
  import('./billing/process/custDebitNotes')
);

const CustCreditNotes = React.lazy(() =>
  import('./billing/process/custCreditNotes')
);

const BillingReports = React.lazy(() =>
  import('./billing/reports')
);

const SalesReport = React.lazy(() =>
  import('./billing/reports/salesReport')
);

const BoxesReport = React.lazy(() =>
  import('./billing/reports/boxesReport')
);

const Inventory = React.lazy(() =>
  import('./inventory')
);

const InventorySettings = React.lazy(() =>
  import('./inventory/settings')
);

const Stores = React.lazy(() =>
  import('./inventory/settings/store')
);

const MeasurementUnits = React.lazy(() =>
  import('./inventory/settings/measurementUnits')
);

const ConversionFactors = React.lazy(() =>
  import('./inventory/settings/conversionFactors')
);

const TypeProducts = React.lazy(() =>
  import('./inventory/settings/typeProducts')
);

const ProductsCatalog = React.lazy(() =>
  import('./inventory/settings/productsCatalog')
);

const StoresProducts = React.lazy(() =>
  import('./inventory/settings/storesProducts')
);

const InventoryProcess = React.lazy(() =>
  import('./inventory/process')
);

const Providers = React.lazy(() =>
  import('./inventory/process/providers')
);

const PurchaseOrders = React.lazy(() =>
  import('./inventory/process/purchaseOrders')
);

const Purchases = React.lazy(() =>
  import('./inventory/process/purchases')
);

const OtherPurchases = React.lazy(() =>
  import('./inventory/process/otherPurchases')
);

const FuelPurchases = React.lazy(() =>
  import('./inventory/process/fuelPurchases')
);

const TicketPurchase = React.lazy(() =>
  import('./inventory/process/ticketPurchase')
);

const Stock = React.lazy(() =>
  import('./inventory/process/stock')
);

const CreditNotesProv = React.lazy(() =>
  import('./inventory/process/creditNotesProv')
);

const DebitNotesProv = React.lazy(() =>
  import('./inventory/process/debitNotesProv')
);

const TransferToStores = React.lazy(() =>
  import('./inventory/process/transferToStores')
);

const Requisitions = React.lazy(() =>
  import('./inventory/process/requisitions')
);

const Refunds = React.lazy(() =>
  import('./inventory/process/refunds')
);

const InventoryAdjustment = React.lazy(() =>
  import('./inventory/process/inventoryAdjustment')
);

const ChangeCode = React.lazy(() =>
  import('./inventory/process/changeCode')
);

const CostAdjustment = React.lazy(() =>
  import('./inventory/process/costAdjustment')
);

const InventoryReports = React.lazy(() =>
  import('./inventory/reports')
);

const PurchaseReport = React.lazy(() =>
  import('./inventory/reports/purchaseReport')
);

const InventoryReport = React.lazy(() =>
  import('./inventory/reports/inventoryReport')
);

const PurchaseMemo = React.lazy(() =>
  import('./inventory/reports/purchaseMemo')
);

const InventoryMemo = React.lazy(() =>
  import('./inventory/reports/inventoryMemo')
);

const Accounting = React.lazy(() =>
  import('./accounting')
);

const AccountingSettings = React.lazy(() =>
  import('./accounting/settings')
);

const LedgerAccounts = React.lazy(() =>
  import('./accounting/settings/ledgerAccounts')
);

const TransactionConcepts = React.lazy(() =>
  import('./accounting/settings/transactionConcepts')
);

const BudgetStructure = React.lazy(() =>
  import('./accounting/settings/budgetStructure')
);

const IncomeStatement = React.lazy(() =>
  import('./accounting/settings/incomeStatement')
);

const RecurringItems = React.lazy(() =>
  import('./accounting/settings/recurringItems')
);

const AccountingProcess = React.lazy(() =>
  import('./accounting/process')
);

const WorkOrders = React.lazy(() =>
  import('./accounting/process/workOrders')
);

const AccountsReceivable = React.lazy(() =>
  import('./accounting/process/accountsReceivable')
);

const AccountsToPay = React.lazy(() =>
  import('./accounting/process/accountsToPay')
);

const DailyItems = React.lazy(() =>
  import('./accounting/process/dailyItems')
);

const DiaryBook = React.lazy(() =>
  import('./accounting/process/diaryBook')
);

const Ledger = React.lazy(() =>
  import('./accounting/process/ledger')
);

const CashFlow = React.lazy(() =>
  import('./accounting/process/cashFlow')
);

const AdminExpenses = React.lazy(() =>
  import('./accounting/process/adminExpenses')
);

const AccountingReports = React.lazy(() =>
  import('./accounting/reports')
);

const ModuleAudit = React.lazy(() =>
  import('./accounting/reports/moduleAudit')
);

const ModuleOpeningClosing = React.lazy(() =>
  import('./accounting/reports/moduleOpeningClosing')
);

const AccountingClosures = React.lazy(() =>
  import('./accounting/reports/accountingClosures')
);

const AccountingReport = React.lazy(() =>
  import('./accounting/reports/accountingReports')
);

const Taxes = React.lazy(() =>
  import('./taxes')
);

const TaxesSettings = React.lazy(() =>
  import('./taxes/settings')
);

const FiscalPeriods = React.lazy(() =>
  import('./taxes/settings/fiscalPeriods')
);

const TypesTaxes = React.lazy(() =>
  import('./taxes/settings/typesTaxes')
);

const TypesRetention = React.lazy(() =>
  import('./taxes/settings/typesRetention')
);

const TaxesProcess = React.lazy(() =>
  import('./taxes/process')
);

const RetentionReceipt = React.lazy(() =>
  import('./taxes/process/retentionReceipt')
);

const TaxesReports = React.lazy(() =>
  import('./taxes/reports')
);

const PurchaseReportTax = React.lazy(() =>
  import('./taxes/reports/purchaseReport')
);

const ProvidersCNReport = React.lazy(() =>
  import('./taxes/reports/providersCNReport')
);

const ProvidersDNReport = React.lazy(() =>
  import('./taxes/reports/providersDNReport')
);

const SalesReportTax = React.lazy(() =>
  import('./taxes/reports/salesReport')
);

const RetentionReport = React.lazy(() =>
  import('./taxes/reports/retentionReport')
);

const Banks = React.lazy(() =>
  import('./banks')
);

const BanksSettings = React.lazy(() =>
  import('./banks/settings')
);

const BanksAccounts = React.lazy(() =>
  import('./banks/settings/banksAccounts')
);

const Scheduling = React.lazy(() =>
  import('./banks/settings/scheduling')
);

const BanksProcess = React.lazy(() =>
  import('./banks/process')
);

const CheckRequest = React.lazy(() =>
  import('./banks/process/checkRequest')
);

const Checks = React.lazy(() =>
  import('./banks/process/checks')
);

const Transfers = React.lazy(() =>
  import('./banks/process/transfers')
);

const TransBetweenAccounts = React.lazy(() =>
  import('./banks/process/transBetweenAccounts')
);

const TransBetweenAffiliates = React.lazy(() =>
  import('./banks/process/transBetweenAffiliates')
);

const CustomerDeposits = React.lazy(() =>
  import('./banks/process/customerDeposits')
);

const VariousDeposits = React.lazy(() =>
  import('./banks/process/variousDeposits')
);

const CashWithdrawal = React.lazy(() =>
  import('./banks/process/cashWithdrawal')
);

const AffiliateDeposits = React.lazy(() =>
  import('./banks/process/affiliateDeposits')
);

const DebCredNotes = React.lazy(() =>
  import('./banks/process/debCredNotes')
);

const BanksReports = React.lazy(() =>
  import('./banks/reports')
);

const BanksBook = React.lazy(() =>
  import('./banks/reports/banksBook')
);

const BankConciliation = React.lazy(() =>
  import('./banks/reports/bankConciliation')
);

const BankReports = React.lazy(() =>
  import('./banks/reports/bankReports')
);

const Payments = React.lazy(() =>
  import('./banks/reports/payments')
);

const Settings = React.lazy(() =>
  import('./settings')
);

const BillingInternalDocuments = React.lazy(() =>
  import('./settings/internalDocuments')
);

const BillingTaxDocuments = React.lazy(() =>
  import('./settings/taxDocuments')
);

const CompanyInformation = React.lazy(() =>
  import('./settings/companyInformation')
);

const Currency = React.lazy(() =>
  import('./settings/currency')
);

const ProviderTypes = React.lazy(() =>
  import('./settings/providerTypes')
);

const CustomerTypes = React.lazy(() =>
  import('./settings/customerTypes')
);

const Intercompanies = React.lazy(() =>
  import('./settings/intercompanies')
);

const UserAccounts = React.lazy(() =>
  import('./settings/userAccounts')
);

const Users = React.lazy(() =>
  import('./settings/userAccounts/users')
);

const UserProfile = React.lazy(() =>
  import('./settings/userAccounts/users/userProfile')
);

const Modules = React.lazy(() =>
  import('./settings/userAccounts/modules')
);

const HumanResources = React.lazy(() =>
  import('./humanResources')
);

const HumanResourcesSettings = React.lazy(() =>
  import('./humanResources/settings')
);

const DefaultValues = React.lazy(() =>
  import('./humanResources/settings/defaultValues')
);

const JobPositions = React.lazy(() =>
  import('./humanResources/settings/jobpositions')
);

const Schedules = React.lazy(() =>
  import('./humanResources/settings/schedules')
);

const TaxCalculation = React.lazy(() =>
  import('./humanResources/settings/taxCalculation')
);

const NeighborhoodTax = React.lazy(() =>
  import('./humanResources/settings/neighborhoodTax')
);

const Overtime = React.lazy(() =>
  import('./humanResources/settings/overtime')
);

const VacationSetting = React.lazy(() =>
  import('./humanResources/settings/vacations')
);

const FaultTypes = React.lazy(() =>
  import('./humanResources/settings/faultTypes')
);

const Biweeklys = React.lazy(() =>
  import('./humanResources/settings/biweeklys')
);

const HumanResourcesProcess = React.lazy(() =>
  import('./humanResources/process')
);

const Employees = React.lazy(() =>
  import('./humanResources/process/employees')
);

const PrintCarnet = React.lazy(() =>
  import('./humanResources/process/printCarnet')
);

const Permissions = React.lazy(() =>
  import('./humanResources/process/permissions')
);

const Vacations = React.lazy(() =>
  import('./humanResources/process/vacations')
);

const Accidents = React.lazy(() =>
  import('./humanResources/process/accidents')
);

const Incapacities = React.lazy(() =>
  import('./humanResources/process/incapacities')
);

const Admonitions = React.lazy(() =>
  import('./humanResources/process/admonitions')
);

const ProofWork = React.lazy(() =>
  import('./humanResources/process/proofWork')
);

const Projects = React.lazy(() =>
  import('./humanResources/process/projects')
);

const DailyReport = React.lazy(() =>
  import('./humanResources/process/dailyReport')
);

const DailyPayroll = React.lazy(() =>
  import('./humanResources/process/dailyPayroll')
);

const SeventhDay = React.lazy(() =>
  import('./humanResources/process/seventhDay')
);

const Deductions = React.lazy(() =>
  import('./humanResources/process/deductions')
);

const ResumePayroll = React.lazy(() =>
  import('./humanResources/process/resumePayroll')
);

const BiweeklyPayroll = React.lazy(() =>
  import('./humanResources/process/biweeklyPayroll')
);

const PaymentPlans = React.lazy(() =>
  import('./humanResources/process/paymentPlans')
);

const DeductionBiweekly = React.lazy(() =>
  import('./humanResources/process/deductionBiweekly')
);

const HumanResourcesReports = React.lazy(() =>
  import('./humanResources/reports')
);

const InputOutputs = React.lazy(() =>
  import('./humanResources/reports/inputOutputs')
);

const App = ({ match }) => {
  const [isLoading, setLoading] = useState(false);
  return (
    <AppLayout>
      <Loading show={isLoading} />
      <div className="dashboard-wrapper">
        <Suspense fallback={<div className="loading" style={{ display: isLoading ? "block" : "none" }} />}>
          <Switch>
            {/* <Redirect exact from={`${match.url}/`} to={`${match.url}/`} /> */}
            <Route
              path={`${match.url}/`}
              exact
              render={(props) => <Gogo setLoading={setLoading}  {...props} />}
            />
            <Route
              path={`${match.url}/second-menu`}
              render={(props) => <SecondMenu setLoading={setLoading}  {...props} />}
            />
            {/* <ProtectedRoute
                    path={`${match.url}/second-menu`}
                    component={SecondMenu}
                    roles={[UserRole.Admin]}
            /> */}
            <Route
              path={`${match.url}/blank-page`}
              render={(props) => <BlankPage setLoading={setLoading}  {...props} />}
            />
            <Route
              path={`${match.url}/production`}
              exact
              render={(props) => <Production setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings`}
              exact
              render={(props) => <ProductionSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/ordersTypes`}
              exact
              render={(props) => <OrdersTypes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/customers`}
              exact
              render={(props) => <Customers setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/managers`}
              exact
              render={(props) => <Managers setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/destinations`}
              exact
              render={(props) => <Destinations setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/productsTypes`}
              exact
              render={(props) => <ProductsTypes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/settings/rawMaterial`}
              exact
              render={(props) => <RawMaterial setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/process`}
              exact
              render={(props) => <ProductionProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/process/workOrders`}
              exact
              render={(props) => <WorkOrdersProd setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/process/workOrders/projectDetail`}
              exact
              render={(props) => <ProjectDetail setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/production/process/charges`}
              exact
              render={(props) => <Charges setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing`}
              exact
              render={(props) => <Billing setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/settings`}
              exact
              render={(props) => <BillingSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/settings/billingAreas`}
              exact
              render={(props) => <BillingAreas setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/settings/cashBoxes`}
              exact
              render={(props) => <CashBoxes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/settings/paymentMethods`}
              exact
              render={(props) => <PaymentMethods setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/settings/discounts`}
              exact
              render={(props) => <Discounts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process`}
              exact
              render={(props) => <BillingProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process/customers`}
              exact
              render={(props) => <Customers setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process/invoicing`}
              exact
              render={(props) => <Invoicing setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process/pointSales`}
              exact
              render={(props) => <PointSales setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process/custDebitNotes`}
              exact
              render={(props) => <CustDebitNotes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/process/custCreditNotes`}
              exact
              render={(props) => <CustCreditNotes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/reports`}
              exact
              render={(props) => <BillingReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/reports/salesReport`}
              exact
              render={(props) => <SalesReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/billing/reports/boxesReport`}
              exact
              render={(props) => <BoxesReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory`}
              exact
              render={(props) => <Inventory setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings`}
              exact
              render={(props) => <InventorySettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/store`}
              exact
              render={(props) => <Stores setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/measurementUnits`}
              exact
              render={(props) => <MeasurementUnits setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/conversionFactors`}
              exact
              render={(props) => <ConversionFactors setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/typeProducts`}
              exact
              render={(props) => <TypeProducts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/productsCatalog`}
              exact
              render={(props) => <ProductsCatalog setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/settings/storesProducts`}
              exact
              render={(props) => <StoresProducts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process`}
              exact
              render={(props) => <InventoryProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/providers`}
              exact
              render={(props) => <Providers setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/purchaseOrders`}
              exact
              render={(props) => <PurchaseOrders setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/purchases`}
              exact
              render={(props) => <Purchases setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/otherPurchases`}
              exact
              render={(props) => <OtherPurchases setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/fuelPurchases`}
              exact
              render={(props) => <FuelPurchases setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/ticketPurchase`}
              exact
              render={(props) => <TicketPurchase setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/stock`}
              exact
              render={(props) => <Stock setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/creditNotesProv`}
              exact
              render={(props) => <CreditNotesProv setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/debitNotesProv`}
              exact
              render={(props) => <DebitNotesProv setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/transferToStores`}
              exact
              render={(props) => <TransferToStores setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/requisitions`}
              exact
              render={(props) => <Requisitions setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/refunds`}
              exact
              render={(props) => <Refunds setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/inventoryAdjustment`}
              exact
              render={(props) => <InventoryAdjustment setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/changeCode`}
              exact
              render={(props) => <ChangeCode setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/process/costAdjustment`}
              exact
              render={(props) => <CostAdjustment setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/reports`}
              exact
              render={(props) => <InventoryReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/reports/purchaseReport`}
              exact
              render={(props) => <PurchaseReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/reports/inventoryReport`}
              exact
              render={(props) => <InventoryReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/reports/purchaseMemo`}
              exact
              render={(props) => <PurchaseMemo setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/inventory/reports/inventoryMemo`}
              exact
              render={(props) => <InventoryMemo setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting`}
              exact
              render={(props) => <Accounting setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings`}
              exact
              render={(props) => <AccountingSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings/ledgerAccounts`}
              exact
              render={(props) => <LedgerAccounts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings/transactionConcepts`}
              exact
              render={(props) => <TransactionConcepts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings/budgetStructure`}
              exact
              render={(props) => <BudgetStructure setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings/incomeStatement`}
              exact
              render={(props) => <IncomeStatement setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/settings/recurringItems`}
              exact
              render={(props) => <RecurringItems setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process`}
              exact
              render={(props) => <AccountingProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/workOrders`}
              exact
              render={(props) => <WorkOrders setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/accountsReceivable`}
              exact
              render={(props) => <AccountsReceivable setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/accountsToPay`}
              exact
              render={(props) => <AccountsToPay setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/dailyItems`}
              exact
              render={(props) => <DailyItems setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/diaryBook`}
              exact
              render={(props) => <DiaryBook setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/ledger`}
              exact
              render={(props) => <Ledger setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/cashFlow`}
              exact
              render={(props) => <CashFlow setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/process/adminExpenses`}
              exact
              render={(props) => <AdminExpenses setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/reports`}
              exact
              render={(props) => <AccountingReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/reports/moduleAudit`}
              exact
              render={(props) => <ModuleAudit setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/reports/moduleOpeningClosing`}
              exact
              render={(props) => <ModuleOpeningClosing setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/reports/accountingClosures`}
              exact
              render={(props) => <AccountingClosures setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/accounting/reports/accountingReports`}
              exact
              render={(props) => <AccountingReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes`}
              exact
              render={(props) => <Taxes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/settings`}
              exact
              render={(props) => <TaxesSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/settings/fiscalPeriods`}
              exact
              render={(props) => <FiscalPeriods setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/settings/typesTaxes`}
              exact
              render={(props) => <TypesTaxes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/settings/typesRetention`}
              exact
              render={(props) => <TypesRetention setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/process`}
              exact
              render={(props) => <TaxesProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/process/retentionReceipt`}
              exact
              render={(props) => <RetentionReceipt setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports`}
              exact
              render={(props) => <TaxesReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports/purchaseReport`}
              exact
              render={(props) => <PurchaseReportTax setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports/providersCNReport`}
              exact
              render={(props) => <ProvidersCNReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports/providersDNReport`}
              exact
              render={(props) => <ProvidersDNReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports/salesReport`}
              exact
              render={(props) => <SalesReportTax setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/taxes/reports/retentionReport`}
              exact
              render={(props) => <RetentionReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks`}
              exact
              render={(props) => <Banks setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/settings`}
              exact
              render={(props) => <BanksSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/settings/banksAccounts`}
              exact
              render={(props) => <BanksAccounts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/settings/scheduling`}
              exact
              render={(props) => <Scheduling setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process`}
              exact
              render={(props) => <BanksProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/checkRequest`}
              exact
              render={(props) => <CheckRequest setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/checks`}
              exact
              render={(props) => <Checks setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/transfers`}
              exact
              render={(props) => <Transfers setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/transBetweenAccounts`}
              exact
              render={(props) => <TransBetweenAccounts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/transBetweenAffiliates`}
              exact
              render={(props) => <TransBetweenAffiliates setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/customerDeposits`}
              exact
              render={(props) => <CustomerDeposits setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/variousDeposits`}
              exact
              render={(props) => <VariousDeposits setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/cashWithdrawal`}
              exact
              render={(props) => <CashWithdrawal setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/affiliateDeposits`}
              exact
              render={(props) => <AffiliateDeposits setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/process/debCredNotes`}
              exact
              render={(props) => <DebCredNotes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/reports`}
              exact
              render={(props) => <BanksReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/reports/banksBook`}
              exact
              render={(props) => <BanksBook setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/reports/bankConciliation`}
              exact
              render={(props) => <BankConciliation setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/reports/bankReports`}
              exact
              render={(props) => <BankReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/banks/reports/payments`}
              exact
              render={(props) => <Payments setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings`}
              exact
              render={(props) => <Settings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/internalDocuments`}
              exact
              render={(props) => <BillingInternalDocuments setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/taxDocuments`}
              exact
              render={(props) => <BillingTaxDocuments setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/companyInformation`}
              exact
              render={(props) => <CompanyInformation setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/currency`}
              exact
              render={(props) => <Currency setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/providerTypes`}
              exact
              render={(props) => <ProviderTypes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/customerTypes`}
              exact
              render={(props) => <CustomerTypes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/intercompanies`}
              exact
              render={(props) => <Intercompanies setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/userAccounts`}
              exact
              render={(props) => <UserAccounts setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/userAccounts/users`}
              exact
              render={(props) => <Users setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/userAccounts/users/userProfile`}
              exact
              render={(props) => <UserProfile setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/settings/userAccounts/modules`}
              exact
              render={(props) => <Modules setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources`}
              exact
              render={(props) => <HumanResources setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings`}
              exact
              render={(props) => <HumanResourcesSettings setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/defaultValues`}
              exact
              render={(props) => <DefaultValues setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/jobpositions`}
              exact
              render={(props) => <JobPositions setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/schedules`}
              exact
              render={(props) => <Schedules setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/taxCalculation`}
              exact
              render={(props) => <TaxCalculation setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/neighborhoodTax`}
              exact
              render={(props) => <NeighborhoodTax setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/overtime`}
              exact
              render={(props) => <Overtime setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/vacations`}
              exact
              render={(props) => <VacationSetting setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/faultTypes`}
              exact
              render={(props) => <FaultTypes setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/settings/biweeklys`}
              exact
              render={(props) => <Biweeklys setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process`}
              exact
              render={(props) => <HumanResourcesProcess setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/employees`}
              exact
              render={(props) => <Employees setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/permissions`}
              exact
              render={(props) => <Permissions setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/printCarnet`}
              exact
              render={(props) => <PrintCarnet setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/vacations`}
              exact
              render={(props) => <Vacations setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/accidents`}
              exact
              render={(props) => <Accidents setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/incapacities`}
              exact
              render={(props) => <Incapacities setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/admonitions`}
              exact
              render={(props) => <Admonitions setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/proofWork`}
              exact
              render={(props) => <ProofWork setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/projects`}
              exact
              render={(props) => <Projects setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/dailyReport`}
              exact
              render={(props) => <DailyReport setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/dailyPayroll`}
              exact
              render={(props) => <DailyPayroll setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/seventhDay`}
              exact
              render={(props) => <SeventhDay setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/deductions`}
              exact
              render={(props) => <Deductions setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/resumePayroll`}
              exact
              render={(props) => <ResumePayroll setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/biweeklyPayroll`}
              exact
              render={(props) => <BiweeklyPayroll setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/paymentPlans`}
              exact
              render={(props) => <PaymentPlans setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/process/deductionBiweekly`}
              exact
              render={(props) => <DeductionBiweekly setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/reports`}
              exact
              render={(props) => <HumanResourcesReports setLoading={setLoading} {...props} />}
            />
            <Route
              path={`${match.url}/humanResources/reports/inputOutputs`}
              exact
              render={(props) => <InputOutputs setLoading={setLoading} {...props} />}
            />
            <Redirect to="/error" />
          </Switch>
        </Suspense>
      </div>
    </AppLayout>
  );
};

const mapStateToProps = ({ menu }) => {
  const { containerClassnames } = menu;
  return { containerClassnames };
};

export default withRouter(connect(mapStateToProps, {})(App));
