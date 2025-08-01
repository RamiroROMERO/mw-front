import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Reports = (props) => {
  const navigate = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-check",
    title: "menu.moduleAudit",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/reports/moduleAudit`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-switch",
    title: "menu.moduleOpeningClosing",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/reports/moduleIO`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-journal-check",
    title: "menu.accountingClosures",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/reports/accountingClosures`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon iconsminds-line-chart-1",
    title: "menu.accountingReports",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/reports/accountingReports`,
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