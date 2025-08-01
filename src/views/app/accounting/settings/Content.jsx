import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Settings = (props) => {
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon bi bi-journal-text",
    title: "menu.ledgerAccounts",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/ledgerAccounts`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-handshake",
    title: "menu.transactionConcepts",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/transactionConcepts`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon iconsminds-dollar",
    title: "menu.budgetStructure",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/budgetStructure`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-clipboard-data",
    title: "menu.incomeStatement",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/incomeStatement`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon bi bi-card-heading",
    title: "menu.recurringItems",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/recurringItems`,
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