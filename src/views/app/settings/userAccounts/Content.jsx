import React from 'react';
import { useNavigate } from "react-router-dom"
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const UserAccounts = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon simple-icon-people",
    title: "menu.users",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/userAccounts/users`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon simple-icon-grid",
    title: "menu.modules",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/userAccounts/modules`,
        { replace: true }
      );
    }
  }
  ]
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.userAccounts" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <Row className="icon-cards-row mb-2">
        {propsToCard.map((item) => {
          return (
            <Colxx xxs="6" sm="4" md="3" lg="2" key={`icon_card_${item.id}`}>
              <IconCard {...item} className="mb-4" />
            </Colxx>
          );
        })}
      </Row>
      <br />
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody />
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default UserAccounts;