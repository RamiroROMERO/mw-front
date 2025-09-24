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
      icon: "large-icon bi bi-building",
      title: "menu.rooms",
      fnOnclick: () => {
        history(
          `${adminRoot}/hotelManagement/settings/rooms`,
          { replace: true }
        );
      }
    },
    {
      id: 2,
      icon: "large-icon bi bi-1-square",
      title: "menu.tables",
      fnOnclick: () => {
        history(
          `${adminRoot}/hotelManagement/settings/tables`,
          { replace: true }
        );
      }
    },
    {
      id: 3,
      icon: "large-icon bi bi-basket",
      title: "menu.materiales",
      fnOnclick: () => {
        history(
          `${adminRoot}/hotelManagement/settings/materiales`,
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