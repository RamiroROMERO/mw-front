import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Settings = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon bi bi-receipt-cutoff",
    title: "menu.billingAreas",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/settings/billingAreas`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-cash-register-2",
    title: "menu.cashBoxes",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/settings/cashBoxes`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-cash-coin",
    title: "menu.paymentMethods",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/settings/paymentMethods`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-percent",
    title: "menu.discounts",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/settings/discounts`,
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
export default Settings;