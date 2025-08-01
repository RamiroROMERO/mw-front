import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Process = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-male-female",
    title: "menu.providers",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/providers`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-bag-check",
    title: "menu.purchaseOrders",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/purchaseOrders`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-cart-check",
    title: "menu.purchases",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/purchases`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-cart-plus",
    title: "menu.otherPurchases",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/otherPurchases`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon iconsminds-gas-pump",
    title: "menu.fuelPurchases",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/fuelPurchases`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon iconsminds-receipt-4",
    title: "menu.ticketPurchase",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/ticketPurchase`,
        { replace: true }
      );
    }
  },
  {
    id: 7,
    icon: "large-icon iconsminds-checkout-basket",
    title: "menu.stock",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/stock`,
        { replace: true }
      );
    }
  },
  {
    id: 8,
    icon: "large-icon simple-icon-docs",
    title: "menu.debitNotesProv",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/debitNotesProv`,
        { replace: true }
      );
    }
  },
  {
    id: 9,
    icon: "large-icon simple-icon-docs",
    title: "menu.creditNotesProv",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/creditNotesProv`,
        { replace: true }
      );
    }
  },
  {
    id: 10,
    icon: "large-icon iconsminds-repeat",
    title: "menu.transferToStores",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/transferToStores`,
        { replace: true }
      );
    }
  },
  {
    id: 11,
    icon: "large-icon iconsminds-notepad",
    title: "menu.requisitions",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/requisitions`,
        { replace: true }
      );
    }
  },
  {
    id: 12,
    icon: "large-icon iconsminds-reload-1",
    title: "menu.refunds",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/refunds`,
        { replace: true }
      );
    }
  },
  {
    id: 13,
    icon: "large-icon iconsminds-calculator",
    title: "menu.inventoryAdjustment",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/inventoryAdjustment`,
        { replace: true }
      );
    }
  },
  {
    id: 14,
    icon: "large-icon bi bi-123",
    title: "menu.changeCode",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/changeCode`,
        { replace: true }
      );
    }
  },
  {
    id: 15,
    icon: "large-icon iconsminds-gears",
    title: "menu.costAdjustment",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process/costAdjustment`,
        { replace: true }
      );
    }
  }
  ]
  return (
    <>
      <Row className="icon-cards-row mb-2">
        {propsToCard.map((item) => {
          return (
            <Colxx xxs="6" sm="4" md="3" lg="2" key={`icon_card_${item.id}`}>
              <IconCard {...item} className="mb-4" />
            </Colxx>
          );
        })}
      </Row>
    </>
  );
}
export default Process;