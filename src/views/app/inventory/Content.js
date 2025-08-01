import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Inventory = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-list",
    title: "menu.submenu.settings",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon simple-icon-layers",
    title: "menu.submenu.process",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/process`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon simple-icon-chart",
    title: "menu.submenu.reports",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/reports`,
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
export default Inventory;