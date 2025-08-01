import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import IconCard from '@Components/cards/IconCard';
import { adminRoot } from '@Constants/defaultValues';

const Reports = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = []
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
export default Reports;