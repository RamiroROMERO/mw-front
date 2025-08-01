import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { adminRoot } from '@/constants/defaultValues';
import IconCard from '@/components/cards/IconCard';

const HospitalManagement = (props) => {
  const { match } = props;
  const navigate = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-list",
    title: "menu.submenu.settings",
    fnOnclick: () => {
      navigate(`${adminRoot}/hospitalManagement/settings`,
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
        `${adminRoot}/hospitalManagement/process`,
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
        `${adminRoot}/hospitalManagement/reports`,
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
export default HospitalManagement;