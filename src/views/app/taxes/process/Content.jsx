import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Process = () => {

  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon bi bi-receipt",
    title: "menu.retentionReceipt",
    fnOnclick: () => {
      history(
        `${adminRoot}/taxes/process/retentionReceipt`,
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