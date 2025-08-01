import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Process = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-note",
    title: "menu.checkRequest",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/checkRequest`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-card-text",
    title: "menu.checks",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/checks`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-arrow-right-square",
    title: "menu.transfers",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/transfers`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-arrow-left-right",
    title: "menu.transBetweenAccounts",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/transBetweenAccounts`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon bi bi-arrow-left-right",
    title: "menu.transBetweenAffiliates",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/transBetweenAffiliates`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon iconsminds-financial",
    title: "menu.customerDeposits",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/customerDeposits`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon bi bi-cash-coin",
    title: "menu.variousDeposits",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/variousDeposits`,
        { replace: true }
      );
    }
  },
  {
    id: 7,
    icon: "large-icon iconsminds-dollar",
    title: "menu.cashWithdrawal",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/cashWithdrawal`,
        { replace: true }
      );
    }
  },
  {
    id: 8,
    icon: "large-icon iconsminds-coins-2",
    title: "menu.affiliateDeposits",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/affiliateDeposits`,
        { replace: true }
      );
    }
  },
  {
    id: 9,
    icon: "large-icon simple-icon-docs",
    title: "menu.debCredNotes",
    fnOnclick: () => {
      history(
        `${adminRoot}/banks/process/debCredNotes`,
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