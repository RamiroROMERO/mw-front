import { adminRoot } from './defaultValues';

const data = [
  // {
  //   id: 'production',
  //   icon: 'bi bi-gem',
  //   label: 'menu.production',
  //   to: `${adminRoot}/production`,
  //   subs: [
  //     {
  //       id: 'production-settings',
  //       icon: 'simple-icon-list',
  //       label: 'menu.submenu.settings',
  //       to: `${adminRoot}/production/settings`,
  //       subs: [
  //         {
  //           icon: 'iconsminds-male-female',
  //           label: 'menu.customers',
  //           to: `${adminRoot}/production/settings/customers`,
  //         },
  //         {
  //           icon: 'simple-icon-people',
  //           label: 'menu.managers',
  //           to: `${adminRoot}/production/settings/managers`,
  //         },
  //         {
  //           icon: 'iconsminds-check',
  //           label: 'menu.ordersTypes',
  //           to: `${adminRoot}/production/settings/ordersTypes`,
  //         },
  //         {
  //           icon: 'simple-icon-list',
  //           label: 'menu.productsTypes',
  //           to: `${adminRoot}/production/settings/productsTypes`,
  //         },
  //         {
  //           icon: 'bi bi-pin-map',
  //           label: 'menu.destinations',
  //           to: `${adminRoot}/production/settings/destinations`,
  //         },
  //         {
  //           icon: 'simple-icon-basket-loaded',
  //           label: 'menu.rawMaterial',
  //           to: `${adminRoot}/production/settings/rawMaterial`,
  //         },
  //       ],
  //     },
  //     {
  //       id: 'production-process',
  //       icon: 'simple-icon-layers',
  //       label: 'menu.submenu.process',
  //       to: `${adminRoot}/production/process`,
  //       subs: [
  //         {
  //           icon: 'bi bi-clipboard-check',
  //           label: 'menu.projects',
  //           to: `${adminRoot}/production/process/workOrders`,
  //         },
  //         {
  //           icon: 'iconsminds-billing',
  //           label: 'menu.charges',
  //           to: `${adminRoot}/production/process/charges`,
  //         },
  //       ]
  //     }
  //   ],
  // },
  {
    id: 'dashboards',
    icon: 'bi bi-bar-chart',
    label: 'menu.dashboards',
    to: `${adminRoot}/dashboards`,
    subs: [
      {
        id: 'dashboards-billingSales',
        icon: 'simple-icon-list',
        label: 'menu.submenu.billingSales',
        to: `${adminRoot}/dashboards/billingSales`,
      },
    ]
  },
  {
    id: 'hotelManagement',
    icon: 'bi bi-buildings',
    label: 'menu.hotelManagement',
    to: `${adminRoot}/hotelManagement`,
    subs: [
      {
        id: 'hotelManagement-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/hotelManagement/settings`,
        subs: [{
          id: 'hotelManagement-settings-roomsStatus',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.roomsStatus',
          to: `${adminRoot}/hotelManagement/settings/roomsStatus`,
        },{
          id: 'hotelManagement-settings-roomsTypes',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.roomsTypes',
          to: `${adminRoot}/hotelManagement/settings/roomsTypes`,
        },{
          id: 'hotelManagement-settings-roomsLevels',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.roomsLevels',
          to: `${adminRoot}/hotelManagement/settings/roomsLevels`,
        },{
          id: 'hotelManagement-settings-services',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.services',
          to: `${adminRoot}/hotelManagement/settings/services`,
        },{
          id: 'hotelManagement-settings-roomMealTypes',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.roomMealTypes',
          to: `${adminRoot}/hotelManagement/settings/roomMealTypes`,
        },{
          id: 'hotelManagement-settings-rooms',
          icon: 'bi bi-building',
          label: 'menu.hotelManagement.rooms',
          to: `${adminRoot}/hotelManagement/settings/rooms`,
        },{
          id: 'hotelManagement-settings-tables',
          icon: 'bi bi-1-square',
          label: 'menu.hotelManagement.tables',
          to: `${adminRoot}/hotelManagement/settings/tables`,
        },{
          id: 'hotelManagement-settings-materials',
          icon: 'bi bi-basket',
          label: 'menu.hotelManagement.materials',
          to: `${adminRoot}/hotelManagement/settings/materials`,
        },{
          id: 'hotelManagement-settings-customers',
          icon: 'bi bi-person',
          label: 'menu.hotelManagement.customers',
          to: `${adminRoot}/hotelManagement/settings/customers`,
        },{
          id: 'hotelManagement-settings-bookingStatus',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.bookingStatus',
          to: `${adminRoot}/hotelManagement/settings/bookingStatus`,
        },{
          id: 'hotelManagement-settings-paymentStatus',
          icon: 'bi bi-list-ol',
          label: 'menu.hotelManagement.paymentStatus',
          to: `${adminRoot}/hotelManagement/settings/paymentStatus`,
        }]
      },
      {
        id: 'hotelManagement-process',
        icon: 'simple-icon-list',
        label: 'menu.submenu.process',
        to: `${adminRoot}/hotelManagement/process`,
        subs: [{
          id: 'hotelManagement-process-reservations',
          icon: 'bi bi-card-checklist',
          label: 'menu.hotelManagement.reservations',
          to: `${adminRoot}/hotelManagement/process/reservations`,
        },{
          id: 'hotelManagement-process-restaurantOrders',
          icon: 'bi bi-file-earmark-post',
          label: 'menu.hotelManagement.restaurantOrders',
          to: `${adminRoot}/hotelManagement/process/restaurantOrders`,
        }
        ]
      }
    ]
  },
  {
    id: 'hospitalManagement',
    icon: 'bi bi-hospital',
    label: 'menu.hospitalManagement',
    to: `${adminRoot}/hospitalManagement`,
    subs: [
      {
        id: 'hospitalManagement-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/hospitalManagement/settings`,
        subs: [{
          id: 'hospitalManagement-settings-generalSettings',
          icon: 'bi bi-sliders',
          label: 'menu.hospitalManagement.generalSettings',
          to: `${adminRoot}/hospitalManagement/settings/generalSettings`,
        }, {
          id: 'hospitalManagement-settings-specialties',
          icon: 'bi bi-file-earmark-medical',
          label: 'menu.hospitalManagement.specialties',
          to: `${adminRoot}/hospitalManagement/settings/specialties`,
        },
        {
          id: 'hospitalManagement-settings-specialists',
          icon: 'bi bi-person-lines-fill',
          label: 'menu.hospitalManagement.specialists',
          to: `${adminRoot}/hospitalManagement/settings/specialists`,
        },
        {
          id: 'hospitalManagement-settings-areasIncome',
          icon: 'simple-icon-list',
          label: 'menu.hospitalManagement.areasIncome',
          to: `${adminRoot}/hospitalManagement/settings/areasIncome`,
        },
        {
          id: 'hospitalManagement-settings-reasonsAdmission',
          icon: 'bi bi-journal-medical',
          label: 'menu.hospitalManagement.reasonsAdmission',
          to: `${adminRoot}/hospitalManagement/settings/reasonsAdmission`,
        },
        {
          id: 'hospitalManagement-settings-rooms',
          icon: 'bi bi-building-check',
          label: 'menu.hospitalManagement.rooms',
          to: `${adminRoot}/hospitalManagement/settings/rooms`,
        }]
      },
      {
        id: 'hospitalManagement-process',
        icon: 'simple-icon-list',
        label: 'menu.submenu.process',
        to: `${adminRoot}/hospitalManagement/process`,
        subs: [{
          id: 'hospitalManagement-process-patientFiles',
          icon: 'bi bi-person-vcard',
          label: 'menu.hospitalManagement.patientFiles',
          to: `${adminRoot}/hospitalManagement/process/patientFiles`,
        },
        {
          id: 'hospitalManagement-process-events',
          icon: 'bi bi-calendar-event',
          label: 'menu.hospitalManagement.events',
          to: `${adminRoot}/hospitalManagement/process/events`,
        },
        {
          id: 'hospitalManagement-process-hospitalizations',
          icon: 'bi bi-clipboard2-pulse',
          label: 'menu.hospitalManagement.hospitalizations',
          to: `${adminRoot}/hospitalManagement/process/hospitalizations`,
        },
        {
          id: 'hospitalManagement-process-scheduledAppointments',
          icon: 'bi bi-calendar2-check',
          label: 'menu.hospitalManagement.scheduledAppointments',
          to: `${adminRoot}/hospitalManagement/process/scheduledAppointments`,
        }]
      }
    ]
  },
  {
    id: 'billing',
    icon: 'bi bi-currency-dollar',
    label: 'menu.billing',
    to: `${adminRoot}/billing`,
    subs: [
      {
        id: 'billing-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/billing/settings`,
        subs: [
          {
            icon: 'bi bi-receipt-cutoff',
            label: 'menu.billingAreas',
            to: `${adminRoot}/billing/settings/billingAreas`,
          },
          {
            icon: 'iconsminds-cash-register-2',
            label: 'menu.cashBoxes',
            to: `${adminRoot}/billing/settings/cashBoxes`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.paymentMethods',
            to: `${adminRoot}/billing/settings/paymentMethods`,
          },
          {
            icon: 'bi bi-percent',
            label: 'menu.discounts',
            to: `${adminRoot}/billing/settings/discounts`,
          }
        ],
      },
      {
        id: 'billing-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/billing/process`,
        subs: [
          {
            icon: 'iconsminds-male-female',
            label: 'menu.customers',
            to: `${adminRoot}/billing/process/customers`,
          },
          {
            icon: 'iconsminds-billing',
            label: 'menu.invoicing',
            to: `${adminRoot}/billing/process/invoicing`,
          },
          {
            icon: 'iconsminds-financial',
            label: 'menu.pointSales',
            to: `${adminRoot}/billing/process/pointSales`,
          },
          {
            icon: 'simple-icon-docs',
            label: 'menu.custDebitNotes',
            to: `${adminRoot}/billing/process/custDebitNotes`,
          },
          {
            icon: 'simple-icon-docs',
            label: 'menu.custCreditNotes',
            to: `${adminRoot}/billing/process/custCreditNotes`,
          }
        ],
      },
      {
        id: 'billing-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/billing/reports`,
        subs: [
          {
            icon: 'simple-icon-chart',
            label: 'menu.salesReport',
            to: `${adminRoot}/billing/reports/salesReports`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.generalInvoice',
            to: `${adminRoot}/billing/reports/generalInvoice`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.summaryByProduct',
            to: `${adminRoot}/billing/reports/summaryByProduct`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.salesBySalesperson',
            to: `${adminRoot}/billing/reports/salesBySalesperson`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.monthlySalesCustomer',
            to: `${adminRoot}/billing/reports/monthlySalesCustomer`,
          },
          {
            icon: 'bi bi-bar-chart',
            label: 'menu.boxesReport',
            to: `${adminRoot}/billing/reports/cashReports`,
          }
        ],
      },
    ],
  },
  {
    id: 'inventory',
    icon: 'bi bi-box-seam',
    label: 'menu.inventory',
    to: `${adminRoot}/inventory`,
    subs: [
      {
        id: 'inventory-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/inventory/settings`,
        subs: [
          {
            icon: 'iconsminds-box-close',
            label: 'menu.store',
            to: `${adminRoot}/inventory/settings/store`,
          },
          {
            icon: 'iconsminds-ruler',
            label: 'menu.measurementUnits',
            to: `${adminRoot}/inventory/settings/measurementUnits`,
          },
          {
            icon: 'bi bi-plus-slash-minus',
            label: 'menu.conversionFactors',
            to: `${adminRoot}/inventory/settings/conversionFactors`,
          },
          {
            icon: 'iconsminds-basket-items',
            label: 'menu.typeProducts',
            to: `${adminRoot}/inventory/settings/typeProducts`,
          },
          {
            icon: 'iconsminds-basket-quantity',
            label: 'menu.productsCatalog',
            to: `${adminRoot}/inventory/settings/productsCatalog`,
          },
          {
            icon: 'iconsminds-box-with-folders',
            label: 'menu.storesProducts',
            to: `${adminRoot}/inventory/settings/storesProducts`,
          }
        ],
      },
      {
        id: 'inventory-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/inventory/process`,
        subs: [
          {
            icon: 'iconsminds-male-female',
            label: 'menu.providers',
            to: `${adminRoot}/inventory/process/providers`,
          },
          {
            icon: 'bi bi-bag-check',
            label: 'menu.purchaseOrders',
            to: `${adminRoot}/inventory/process/purchaseOrders`,
          },
          {
            icon: 'bi bi-cart-check',
            label: 'menu.purchases',
            to: `${adminRoot}/inventory/process/purchases`,
          },
          {
            icon: 'bi bi-cart-plus',
            label: 'menu.otherPurchases',
            to: `${adminRoot}/inventory/process/otherPurchases`,
          },
          {
            icon: 'iconsminds-gas-pump',
            label: 'menu.fuelPurchases',
            to: `${adminRoot}/inventory/process/fuelPurchases`,
          },
          {
            icon: 'iconsminds-receipt-4',
            label: 'menu.ticketPurchase',
            to: `${adminRoot}/inventory/process/ticketPurchase`,
          },
          {
            icon: 'iconsminds-checkout-basket',
            label: 'menu.stock',
            to: `${adminRoot}/inventory/process/stock`,
          },
          {
            icon: 'simple-icon-docs',
            label: 'menu.debitNotesProv',
            to: `${adminRoot}/inventory/process/debitNotesProv`,
          },
          {
            icon: 'simple-icon-docs',
            label: 'menu.creditNotesProv',
            to: `${adminRoot}/inventory/process/creditNotesProv`,
          },
          {
            icon: 'iconsminds-repeat',
            label: 'menu.transferToStores',
            to: `${adminRoot}/inventory/process/transferToStores`,
          },
          {
            icon: 'iconsminds-notepad',
            label: 'menu.requisitions',
            to: `${adminRoot}/inventory/process/requisitions`,
          },
          {
            icon: 'iconsminds-reload-1',
            label: 'menu.refunds',
            to: `${adminRoot}/inventory/process/refunds`,
          },
          {
            icon: 'iconsminds-calculator',
            label: 'menu.inventoryAdjustment',
            to: `${adminRoot}/inventory/process/inventoryAdjustment`,
          },
          {
            icon: 'bi bi-123',
            label: 'menu.changeCode',
            to: `${adminRoot}/inventory/process/changeCode`,
          },
          {
            icon: 'iconsminds-gears',
            label: 'menu.costAdjustment',
            to: `${adminRoot}/inventory/process/costAdjustment`,
          }
        ],
      },
      {
        id: 'inventory-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/inventory/reports`,
        subs: [
          {
            icon: 'simple-icon-chart',
            label: 'menu.purchaseReport',
            to: `${adminRoot}/inventory/reports/purchaseReport`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.purchaseForStore',
            to: `${adminRoot}/inventory/reports/purchaseForStore`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.purchaseForProvider',
            to: `${adminRoot}/inventory/reports/purchaseForProvider`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.expensesServices',
            to: `${adminRoot}/inventory/reports/expensesServices`,
          },
          {
            icon: 'bi bi-bar-chart',
            label: 'menu.inventoryReport',
            to: `${adminRoot}/inventory/reports/inventoryReport`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.purchaseMemo',
            to: `${adminRoot}/inventory/reports/purchaseMemo`,
          },
          {
            icon: 'bi bi-bar-chart',
            label: 'menu.inventoryMemo',
            to: `${adminRoot}/inventory/reports/inventoryMemo`,
          }
        ],
      },
    ],
  },
  {
    id: 'accounting',
    icon: 'bi bi-calculator',
    label: 'menu.accounting',
    to: `${adminRoot}/accounting`,
    subs: [
      {
        id: 'accounting-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/accounting/settings`,
        subs: [
          {
            icon: 'bi bi-journal-text',
            label: 'menu.ledgerAccounts',
            to: `${adminRoot}/accounting/settings/ledgerAccounts`,
          },
          // {
          //   icon: 'iconsminds-handshake',
          //   label: 'menu.transactionConcepts',
          //   to: `${adminRoot}/accounting/settings/transactionConcepts`,
          // },
          {
            icon: 'iconsminds-dollar',
            label: 'menu.budgetStructure',
            to: `${adminRoot}/accounting/settings/budgetStructure`,
          },
          {
            icon: 'bi bi-clipboard-data',
            label: 'menu.incomeStatement',
            to: `${adminRoot}/accounting/settings/incomeStatement`,
          },
          {
            icon: 'bi bi-card-heading',
            label: 'menu.recurringItems',
            to: `${adminRoot}/accounting/settings/recurringItems`,
          },
        ],
      },
      {
        id: 'accounting-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/accounting/process`,
        subs: [
          {
            icon: 'bi bi-clipboard-check',
            label: 'menu.workOrders',
            to: `${adminRoot}/accounting/process/workOrders`,
          },
          {
            icon: 'iconsminds-financial',
            label: 'menu.accountsReceivable',
            to: `${adminRoot}/accounting/process/accountsReceivable`,
          },
          {
            icon: 'iconsminds-coins',
            label: 'menu.accountsToPay',
            to: `${adminRoot}/accounting/process/accountsToPay`,
          },
          {
            icon: 'bi bi-card-list',
            label: 'menu.dailyItems',
            to: `${adminRoot}/accounting/process/dailyItems`,
          },
          {
            icon: 'bi bi-journal',
            label: 'menu.diaryBook',
            to: `${adminRoot}/accounting/process/diaryBook`,
          },
          {
            icon: 'bi bi-journal-bookmark-fill',
            label: 'menu.ledger',
            to: `${adminRoot}/accounting/process/ledger`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.cashFlow',
            to: `${adminRoot}/accounting/process/cashFlow`,
          },
          {
            icon: 'bi bi-cash-stack',
            label: 'menu.adminExpenses',
            to: `${adminRoot}/accounting/process/adminExpenses`,
          },
        ],
      },
      {
        id: 'accounting-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/accounting/reports`,
        subs: [
          {
            icon: 'iconsminds-check',
            label: 'menu.moduleAudit',
            to: `${adminRoot}/accounting/reports/moduleAudit`,
          },
          {
            icon: 'iconsminds-switch',
            label: 'menu.moduleOpeningClosing',
            to: `${adminRoot}/accounting/reports/moduleOpeningClosing`,
          },
          {
            icon: 'bi bi-journal-check',
            label: 'menu.accountingClosures',
            to: `${adminRoot}/accounting/reports/accountingClosures`,
          },
          {
            icon: 'iconsminds-line-chart-1',
            label: 'menu.accountingReports',
            to: `${adminRoot}/accounting/reports/accountingReports`,
          }
        ],
      },
    ],
  },
  {
    id: 'tax',
    icon: 'bi bi-percent',
    label: 'menu.tax',
    to: `${adminRoot}/taxes`,
    subs: [
      {
        id: 'tax-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/taxes/settings`,
        subs: [
          {
            icon: 'bi bi-calendar2-week',
            label: 'menu.fiscalPeriods',
            to: `${adminRoot}/taxes/settings/fiscalPeriods`,
          },
          {
            icon: 'bi bi-list-ol',
            label: 'menu.typesTaxes',
            to: `${adminRoot}/taxes/settings/typesTaxes`,
          },
          {
            icon: 'bi bi-list-stars',
            label: 'menu.typesRetention',
            to: `${adminRoot}/taxes/settings/typeRetentions`,
          }
        ],
      },
      {
        id: 'tax-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/taxes/process`,
        subs: [
          {
            icon: 'bi bi-receipt',
            label: 'menu.retentionReceipt',
            to: `${adminRoot}/taxes/process/retentionReceipt`,
          }
        ],
      },
      {
        id: 'tax-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/taxes/reports`,
        subs: [
          {
            icon: 'simple-icon-chart',
            label: 'menu.purchaseReport',
            to: `${adminRoot}/taxes/reports/purchaseReport`,
          },
          {
            icon: 'bi bi-bar-chart',
            label: 'menu.providersCNReport',
            to: `${adminRoot}/taxes/reports/providersCNReport`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.providersDNReport',
            to: `${adminRoot}/taxes/reports/providersDNReport`,
          },
          {
            icon: 'bi bi-bar-chart',
            label: 'menu.salesReport',
            to: `${adminRoot}/taxes/reports/salesReport`,
          },
          {
            icon: 'simple-icon-chart',
            label: 'menu.retentionReport',
            to: `${adminRoot}/taxes/reports/retentionReport`,
          }
        ],
      },
    ],
  },
  {
    id: 'banks',
    icon: 'bi bi-bank',
    label: 'menu.banks',
    to: `${adminRoot}/banks`,
    subs: [
      {
        id: 'banks-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/banks/settings`,
        subs: [
          {
            icon: 'simple-icon-chart',
            label: 'menu.banksAccounts',
            to: `${adminRoot}/banks/settings/banksAccounts`,
          },
          {
            icon: 'bi bi-calendar4-week',
            label: 'menu.scheduling',
            to: `${adminRoot}/banks/settings/scheduling`,
          }
        ],
      },
      {
        id: 'banks-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/banks/process`,
        subs: [
          {
            icon: 'simple-icon-note',
            label: 'menu.checkRequest',
            to: `${adminRoot}/banks/process/checkRequest`,
          },
          {
            icon: 'bi bi-card-text',
            label: 'menu.checks',
            to: `${adminRoot}/banks/process/checks`,
          },
          {
            icon: 'bi bi-arrow-right-square',
            label: 'menu.transfers',
            to: `${adminRoot}/banks/process/transfers`,
          },
          {
            icon: 'bi bi-arrow-left-right',
            label: 'menu.transBetweenAccounts',
            to: `${adminRoot}/banks/process/transBetweenAccounts`,
          },
          {
            icon: 'bi bi-arrow-left-right',
            label: 'menu.transBetweenAffiliates',
            to: `${adminRoot}/banks/process/transBetweenAffiliates`,
          },
          {
            icon: 'iconsminds-financial',
            label: 'menu.customerDeposits',
            to: `${adminRoot}/banks/process/customerDeposits`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.variousDeposits',
            to: `${adminRoot}/banks/process/variousDeposits`,
          },
          {
            icon: 'iconsminds-dollar',
            label: 'menu.cashWithdrawal',
            to: `${adminRoot}/banks/process/cashWithdrawal`,
          },
          {
            icon: 'iconsminds-coins-2',
            label: 'menu.affiliateDeposits',
            to: `${adminRoot}/banks/process/affiliateDeposits`,
          },
          {
            icon: 'simple-icon-docs',
            label: 'menu.debCredNotes',
            to: `${adminRoot}/banks/process/debCredNotes`,
          }
        ],
      },
      {
        id: 'banks-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/banks/reports`,
        subs: [
          {
            icon: 'iconsminds-book',
            label: 'menu.banksBook',
            to: `${adminRoot}/banks/reports/banksBook`,
          },
          {
            icon: 'iconsminds-library',
            label: 'menu.bankConciliation',
            to: `${adminRoot}/banks/reports/bankConciliation`,
          },
          {
            icon: 'iconsminds-line-chart-1',
            label: 'menu.bankReports',
            to: `${adminRoot}/banks/reports/bankReports`,
          },
          {
            icon: 'bi bi-cash',
            label: 'menu.payments',
            to: `${adminRoot}/banks/reports/payments`,
          }
        ],
      },
    ],
  },
  {
    id: 'humanResources',
    icon: 'bi bi-people',
    label: 'menu.humanResources',
    to: `${adminRoot}/humanResources`,
    subs: [
      {
        id: 'humanResources-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/humanResources/settings`,
        subs: [
          // {
          //   icon: 'bi bi-card-list',
          //   label: 'menu.defaultValues',
          //   to: `${adminRoot}/humanResources/settings/defaultValues`,
          // },
          {
            icon: 'bi bi-list-ol',
            label: 'menu.jobpositions',
            to: `${adminRoot}/humanResources/settings/jobpositions`,
          },
          {
            icon: 'bi bi-clock',
            label: 'menu.schedules',
            to: `${adminRoot}/humanResources/settings/schedules`,
          },
          {
            icon: 'bi bi-list-ul',
            label: 'menu.areas',
            to: `${adminRoot}/billing/settings/billingAreas`,
          },
          {
            icon: 'bi bi-calculator',
            label: 'menu.taxCalculation',
            to: `${adminRoot}/humanResources/settings/taxCalculation`,
          },
          {
            icon: 'bi bi-sort-numeric-down',
            label: 'menu.neighborhoodTax',
            to: `${adminRoot}/humanResources/settings/neighborhoodTax`,
          },
          {
            icon: 'bi bi-clock-history',
            label: 'menu.overtime',
            to: `${adminRoot}/humanResources/settings/overtime`,
          },
          {
            icon: 'bi bi-calendar-range',
            label: 'menu.vacations',
            to: `${adminRoot}/humanResources/settings/vacations`,
          },
          {
            icon: 'bi bi-list-nested',
            label: 'menu.faultTypes',
            to: `${adminRoot}/humanResources/settings/faultTypes`,
          },
          {
            icon: 'bi bi-calendar-event',
            label: 'menu.biweeklys',
            to: `${adminRoot}/humanResources/settings/biweeklys`,
          },
          {
            icon: 'bi bi-list-ul',
            label: 'menu.humanResources.deductionTypes',
            to: `${adminRoot}/humanResources/settings/deductionTypes`,
          },
          {
            icon: 'bi bi-calendar-week',
            label: 'menu.humanResources.daysTypes',
            to: `${adminRoot}/humanResources/settings/daysTypes`,
          }
        ],
      },
      {
        id: 'humanResources-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/humanResources/process`,
        subs: [
          {
            icon: 'iconsminds-male-female',
            label: 'menu.employees',
            to: `${adminRoot}/humanResources/process/employees`,
          },
          {
            icon: 'bi bi-person-badge',
            label: 'menu.printCarnet',
            to: `${adminRoot}/humanResources/process/printCarnet`,
          },
          {
            icon: 'bi bi-file-earmark-check',
            label: 'menu.permissions',
            to: `${adminRoot}/humanResources/process/permissions`,
          },
          {
            icon: 'bi bi-calendar4-week',
            label: 'menu.vacations',
            to: `${adminRoot}/humanResources/process/vacations`,
          },
          {
            icon: 'bi bi-clipboard-pulse',
            label: 'menu.accidents',
            to: `${adminRoot}/humanResources/process/accidents`,
          },
          {
            icon: 'bi bi-file-earmark-medical',
            label: 'menu.incapacities',
            to: `${adminRoot}/humanResources/process/incapacities`,
          },
          {
            icon: 'bi bi-exclamation-square',
            label: 'menu.admonitions',
            to: `${adminRoot}/humanResources/process/admonitions`,
          },
          {
            icon: 'bi bi-file-earmark-text',
            label: 'menu.proofWork',
            to: `${adminRoot}/humanResources/process/proofWork`,
          },
          {
            icon: 'bi bi-clipboard-check',
            label: 'menu.projects',
            to: `${adminRoot}/humanResources/process/projects`,
          },
          // {
          //   icon: 'bi bi-file-text',
          //   label: 'menu.dailyReport',
          //   to: `${adminRoot}/humanResources/process/dailyReport`,
          // },
          // {
          //   icon: 'bi bi-cash',
          //   label: 'menu.dailyPayroll',
          //   to: `${adminRoot}/humanResources/process/dailyPayroll`,
          // },
          // {
          //   icon: 'bi bi-currency-dollar',
          //   label: 'menu.seventhDay',
          //   to: `${adminRoot}/humanResources/process/seventhDay`,
          // },
          {
            icon: 'bi bi-plus-circle',
            label: 'menu.incomes',
            to: `${adminRoot}/humanResources/process/incomes`,
          },
          {
            icon: 'bi bi-dash-circle',
            label: 'menu.deductions',
            to: `${adminRoot}/humanResources/process/deductions`,
          },
          {
            icon: 'bi bi-card-heading',
            label: 'menu.paymentPlans',
            to: `${adminRoot}/humanResources/process/paymentPlans`,
          },
          // {
          //   icon: 'bi bi-calendar-check',
          //   label: 'menu.attendanceControl',
          //   to: `${adminRoot}/humanResources/process/attendanceControl`,
          // },
          {
            icon: 'bi bi-cash-stack',
            label: 'menu.resumePayroll',
            to: `${adminRoot}/humanResources/process/resumePayroll`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.thirteenthMonth',
            to: `${adminRoot}/humanResources/process/thirteenthMonth`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.fourteenthMonth',
            to: `${adminRoot}/humanResources/process/fourteenthMonth`,
          },
          {
            icon: 'bi bi-cash-coin',
            label: 'menu.vacationPayroll',
            to: `${adminRoot}/humanResources/process/vacationPayroll`,
          },
          {
            icon: 'bi bi-percent',
            label: 'menu.neighborhoodTaxPayroll',
            to: `${adminRoot}/humanResources/process/neighborhoodTaxPayroll`,
          },
          // {
          //   icon: 'bi bi-cash-coin',
          //   label: 'menu.biweeklyPayroll',
          //   to: `${adminRoot}/humanResources/process/biweeklyPayroll`,
          // },
          // {
          //   icon: 'bi bi-dash-circle',
          //   label: 'menu.deductionBiweekly',
          //   to: `${adminRoot}/humanResources/process/deductionBiweekly`,
          // }
        ],
      },
      {
        id: 'humanResources-reports',
        icon: 'simple-icon-chart',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/humanResources/reports`,
        subs: [
          {
            icon: 'bi bi-card-checklist',
            label: 'menu.inputOutputs',
            to: `${adminRoot}/humanResources/reports/inputOutputs`,
          },
          {
            icon: 'bi bi-person-check',
            label: 'menu.employeesByCust',
            to: `${adminRoot}/humanResources/reports/employeesByCust`,
          },
          {
            icon: 'bi bi-wallet',
            label: 'menu.salaries',
            to: `${adminRoot}/humanResources/reports/salaries`,
          },
          {
            icon: 'bi bi-calendar4-week',
            label: 'menu.controlVacations',
            to: `${adminRoot}/humanResources/reports/controlVacations`,
          },
          {
            icon: 'bi bi-file-earmark-check',
            label: 'menu.controlPermissions',
            to: `${adminRoot}/humanResources/reports/controlPermissions`,
          },
          {
            icon: 'bi bi-file-earmark-medical',
            label: 'menu.controlIncapacities',
            to: `${adminRoot}/humanResources/reports/controlIncapacities`,
          },
          {
            icon: 'bi bi-card-heading',
            label: 'menu.pendingPayments',
            to: `${adminRoot}/humanResources/reports/pendingPayments`,
          },
          {
            icon: 'bi bi-person-dash',
            label: 'menu.staffDepartures',
            to: `${adminRoot}/humanResources/reports/staffDepartures`,
          },
          {
            icon: 'bi bi-arrow-left-right',
            label: 'menu.projectTransfers',
            to: `${adminRoot}/humanResources/reports/projectTransfers`,
          }
        ],
      },
    ],
  },
  {
    id: 'fixedAssets',
    icon: 'bi bi-building-gear',
    label: 'menu.fixedAssets',
    to: `${adminRoot}/fixedAssets`,
    subs: [
      {
        id: 'fixedAssets-settings',
        icon: 'simple-icon-list',
        label: 'menu.submenu.settings',
        to: `${adminRoot}/fixedAssets/settings`,
        subs: [{
          id: 'fixedAssets-settings-types',
          icon: 'simple-icon-list',
          label: 'menu.fixedAssets.types',
          to: `${adminRoot}/fixedAssets/settings/types`,
        },
        // {
        //   id: 'fixedAssets-settings-areas',
        //   icon: 'bi bi-card-checklist',
        //   label: 'menu.fixedAssets.areas',
        //   to: `${adminRoot}/fixedAssets/settings/areas`,
        // },
        {
          id: 'fixedAssets-settings-resp',
          icon: 'bi bi-person-gear',
          label: 'menu.fixedAssets.responsibles',
          to: `${adminRoot}/fixedAssets/settings/responsibles`,
        }]
      }, {
        id: 'fixedAssets-process',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.process',
        to: `${adminRoot}/fixedAssets/process`,
        subs: [{
          id: 'fixedAssets-process-register',
          icon: 'bi bi-building-gear',
          label: 'menu.fixedAssets.register',
          to: `${adminRoot}/fixedAssets/process/register`,
        }, {
          id: 'fixedAssets-process-calculate',
          icon: 'simple-icon-calculator',
          label: 'menu.fixedAssets.calculate',
          to: `${adminRoot}/fixedAssets/process/calculate`,
        }, {
          id: 'fixedAssets-process-assign',
          icon: 'bi bi-building-up',
          label: 'menu.fixedAssets.assign',
          to: `${adminRoot}/fixedAssets/process/assginate`,
        }, {
          id: 'fixedAssets-process-reasignate',
          icon: 'bi bi-arrow-left-right',
          label: 'menu.fixedAssets.reasign',
          to: `${adminRoot}/fixedAssets/process/reasignate`,
        }, {
          id: 'fixedAssets-process-remove',
          icon: 'bi bi-building-dash',
          label: 'menu.fixedAssets.remove',
          to: `${adminRoot}/fixedAssets/process/remove`,
        }, {
          id: 'fixedAssets-process-execute',
          icon: 'bi bi-list-nested',
          label: 'menu.fixedAssets.execute',
          to: `${adminRoot}/fixedAssets/process/execute`,
        }]
      }, {
        id: 'fixedAssets-reports',
        icon: 'simple-icon-layers',
        label: 'menu.submenu.reports',
        to: `${adminRoot}/fixedAssets/reports`,
        subs: [{
          id: 'fixedAssets-reports-general',
          icon: 'bi bi-file-bar-graph',
          label: 'menu.fixedAssets.generalReport',
          to: `${adminRoot}/fixedAssets/reports/general`,
        }, {
          id: 'fixedAssets-reports-accumDeprec',
          icon: 'bi bi-file-bar-graph',
          label: 'menu.fixedAssets.accumDeprec',
          to: `${adminRoot}/fixedAssets/reports/accum-deprec`,
        }, {
          id: 'fixedAssets-reports-restDeprec',
          icon: 'bi bi-file-bar-graph',
          label: 'menu.fixedAssets.restDeprec',
          to: `${adminRoot}/fixedAssets/reports/rest-deprec`,
        }]
      }
    ]
  },
  {
    id: 'settings',
    icon: 'bi bi-sliders2-vertical',
    label: 'menu.settings',
    to: `${adminRoot}/second-menu`,
    // roles: [UserRole.Admin, UserRole.Editor],
    subs: [
      {
        icon: 'iconsminds-files',
        label: 'menu.taxDocuments',
        to: `${adminRoot}/settings/taxDocuments`,
      },
      {
        icon: 'iconsminds-file',
        label: 'menu.internalDocuments',
        to: `${adminRoot}/settings/internalDocuments`,
      },
      {
        icon: 'bi bi-building',
        label: 'menu.companyInformation',
        to: `${adminRoot}/settings/companyInformation`,
      },
      {
        icon: 'iconsminds-coins-2',
        label: 'menu.currency',
        to: `${adminRoot}/settings/currency`,
      },
      {
        icon: 'iconsminds-conference',
        label: 'menu.providerTypes',
        to: `${adminRoot}/settings/providerTypes`,
      },
      {
        icon: 'iconsminds-business-man-woman',
        label: 'menu.customerTypes',
        to: `${adminRoot}/settings/customerTypes`,
      },
      {
        icon: 'iconsminds-building',
        label: 'menu.intercompanies',
        to: `${adminRoot}/settings/intercompanies`,
      },
      {
        icon: 'simple-icon-people',
        label: 'menu.userAccounts',
        to: `${adminRoot}/settings/userAccounts`,
        subs: [
          {
            icon: 'simple-icon-people',
            label: 'menu.users',
            to: `${adminRoot}/settings/userAccounts/users`,
          },
          {
            icon: 'simple-icon-grid',
            label: 'menu.modules',
            to: `${adminRoot}/settings/userAccounts/modules`,
          }
        ]
      }
    ],
  },
];
export default data;
