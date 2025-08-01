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
    title: "menu.customers",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/process/customers`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-billing",
    title: "menu.invoicing",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/process/invoicing`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon iconsminds-financial",
    title: "menu.pointSales",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/process/pointSales`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon simple-icon-docs",
    title: "menu.custDebitNotes",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/process/custDebitNotes`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon simple-icon-docs",
    title: "menu.custCreditNotes",
    fnOnclick: () => {
      history(
        `${adminRoot}/billing/process/custCreditNotes`,
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