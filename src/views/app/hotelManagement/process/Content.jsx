import { Row } from 'reactstrap';
import { useNavigate } from "react-router-dom"
import { adminRoot } from '@Constants/defaultValues';
import { Colxx } from '@Components/common/CustomBootstrap';
import IconCard from '@Components/cards/IconCard';

const Content = () => {
  const history = useNavigate();
  const propsToCard = [
    {
      id: 1,
      icon: "large-icon bi bi-card-checklist",
      title: "menu.reservations",
      fnOnclick: () => {
        history(
          `${adminRoot}/hotelManagement/process/reservations`,
          { replace: true }
        );
      }
    },
    {
      id: 2,
      icon: "large-icon bi bi-file-earmark-post",
      title: "menu.restaurantOrders",
      fnOnclick: () => {
        history(
          `${adminRoot}/hotelManagement/process/restaurantOrders`,
          { replace: true }
        );
      }
    },
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
  )
}

export default Content