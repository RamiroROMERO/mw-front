import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Reports = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-chart",
    title: "menu.purchaseReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/reports/purchaseReport`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-bar-chart",
    title: "menu.inventoryReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/reports/inventoryReport`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon simple-icon-chart",
    title: "menu.purchaseMemo",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/reports/purchaseMemo`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-bar-chart",
    title: "menu.inventoryMemo",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/reports/inventoryMemo`,
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
export default Reports;