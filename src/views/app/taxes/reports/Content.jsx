import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Reports = () => {
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-chart",
    title: "menu.purchaseReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/reports/purchaseReport`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-bar-chart",
    title: "menu.providersCNReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/reports/providersCNReport`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon simple-icon-chart",
    title: "menu.providersDNReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/reports/providersDNReport`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-bar-chart",
    title: "menu.salesReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/reports/salesReport`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon simple-icon-chart",
    title: "menu.retentionReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/reports/retentionReport`,
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