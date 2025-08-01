import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Reports = (props) => {
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-book",
    title: "menu.banksBook",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/reports/banksBook`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-library",
    title: "menu.bankConciliation",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/reports/bankConciliation`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon iconsminds-line-chart-1",
    title: "menu.bankReports",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/reports/bankReports`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-cash",
    title: "menu.payments",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/reports/payments`,
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