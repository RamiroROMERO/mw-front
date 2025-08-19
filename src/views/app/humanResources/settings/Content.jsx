import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import IconCard from '@Components/cards/IconCard';
import { adminRoot } from '@Constants/defaultValues';

const Settings = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [
    {
      id: 1,
      icon: "large-icon bi bi-card-list",
      title: "menu.defaultValues",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/defaultValues`,
          { replace: true }
        );
      }
    },
    {
      id: 2,
      icon: "large-icon bi bi-list-ol",
      title: "menu.jobpositions",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/jobpositions`,
          { replace: true }
        );
      }
    },
    {
      id: 3,
      icon: "large-icon bi bi-clock",
      title: "menu.schedules",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/schedules`,
          { replace: true }
        );
      }
    },
    {
      id: 4,
      icon: "large-icon bi bi-list-ul",
      title: "menu.areas",
      fnOnclick: () => {
        history(
          `${adminRoot}/billing/settings/billingAreas`,
          { replace: true }
        );
      }
    },
    {
      id: 5,
      icon: "large-icon bi bi-calculator",
      title: "menu.taxCalculation",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/taxCalculation`,
          { replace: true }
        );
      }
    },
    {
      id: 6,
      icon: "large-icon bi bi-sort-numeric-down",
      title: "menu.neighborhoodTax",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/neighborhoodTax`,
          { replace: true }
        );
      }
    },
    {
      id: 7,
      icon: "large-icon bi bi-clock-history",
      title: "menu.overtime",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/overtime`,
          { replace: true }
        );
      }
    },
    {
      id: 8,
      icon: "large-icon bi bi-calendar-range",
      title: "menu.vacations",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/vacations`,
          { replace: true }
        );
      }
    },
    {
      id: 9,
      icon: "large-icon bi bi-list-nested",
      title: "menu.faultTypes",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/faultTypes`,
          { replace: true }
        );
      }
    },
    {
      id: 10,
      icon: "large-icon bi bi-calendar-event",
      title: "menu.biweeklys",
      fnOnclick: () => {
        history(
          `${adminRoot}/humanResources/settings/biweeklys`,
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