import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Settings = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [
    {
      id: 1,
      icon: "large-icon iconsminds-male-female",
      title: "menu.customers",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/customers`,
          { replace: true }
        );
      }
    },
    {
      id: 2,
      icon: "large-icon simple-icon-people",
      title: "menu.managers",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/managers`,
          { replace: true }
        );
      }
    },
    {
      id: 3,
      icon: "large-icon iconsminds-check",
      title: "menu.ordersTypes",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/ordersTypes`,
          { replace: true }
        );
      }
    },
    {
      id: 4,
      icon: "large-icon simple-icon-list",
      title: "menu.productsTypes",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/productsTypes`,
          { replace: true }
        );
      }
    },
    {
      id: 5,
      icon: "large-icon bi bi-pin-map",
      title: "menu.destinations",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/destinations`,
          { replace: true }
        );
      }
    },
    {
      id: 6,
      icon: "large-icon simple-icon-basket-loaded",
      title: "menu.rawMaterial",
      fnOnclick: () => {
        history(
          `${adminRoot}/production/settings/rawMaterial`,
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