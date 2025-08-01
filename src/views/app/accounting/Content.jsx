import React from 'react';
import { useNavigate } from "react-router-dom"
import { Card, CardBody, CardHeader, CardTitle, Row } from 'reactstrap';
import IntlMessages from '@/helpers/IntlMessages';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Accounting = (props) => {
  const { match } = props;
  const navigate = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-list",
    title: "menu.submenu.settings",
    fnOnclick: () => {
      navigate(`${adminRoot}/accounting/settings`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon simple-icon-layers",
    title: "menu.submenu.process",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/process`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon simple-icon-chart",
    title: "menu.submenu.reports",
    fnOnclick: () => {
      navigate(
        `${adminRoot}/accounting/reports`,
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
export default Accounting;