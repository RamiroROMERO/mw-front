import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Reports = (props) => {
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-chart",
    title: "menu.salesReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/reports/salesReports`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-bar-chart",
    title: "menu.boxesReport",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/reports/cashReports`,
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