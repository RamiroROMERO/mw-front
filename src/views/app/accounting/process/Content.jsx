import React from 'react';
import { useNavigate } from "react-router-dom"
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Process = (props) => {
  const { match } = props;
  const navigate = useNavigate();
  const propsToCard = [
    {
      id: 1,
      icon: "large-icon bi bi-clipboard-check",
      title: "menu.workOrders",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/workOrders`,
          { replace: true }
        );
      }
    },
    {
      id: 2,
      icon: "large-icon iconsminds-financial",
      title: "menu.accountsReceivable",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/accountsReceivable`,
          { replace: true }
        );
      }
    },
    {
      id: 3,
      icon: "large-icon iconsminds-coins",
      title: "menu.accountsToPay",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/accountsToPay`,
          { replace: true }
        );
      }
    },
    {
      id: 4,
      icon: "large-icon bi bi-card-list",
      title: "menu.dailyItems",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/dailyItems`,
          { replace: true }
        );
      }
    },
    {
      id: 5,
      icon: "large-icon bi bi-journal",
      title: "menu.diaryBook",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/diaryBook`,
          { replace: true }
        );
      }
    },
    {
      id: 6,
      icon: "large-icon bi bi-journal-bookmark-fill",
      title: "menu.ledger",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/ledger`,
          { replace: true }
        );
      }
    },
    {
      id: 7,
      icon: "large-icon bi bi-cash-coin",
      title: "menu.cashFlow",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/cashFlow`,
          { replace: true }
        );
      }
    },
    {
      id: 8,
      icon: "large-icon bi bi-cash-stack",
      title: "menu.adminExpenses",
      fnOnclick: () => {
        navigate(
          `${adminRoot}/accounting/process/adminExpenses`,
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