import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import IconCard from '@Components/cards/IconCard';
import { adminRoot } from '@Constants/defaultValues';

const Settings = (props) => {
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon bi bi-file-earmark-medical",
    title: "menu.hospitalManagement.specialties",
    fnOnclick: () => {
      history(
        `${adminRoot}/hospitalManagement/settings/specialties`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-person-lines-fill",
    title: "menu.hospitalManagement.specialists",
    fnOnclick: () => {
      history(
        `${adminRoot}/hospitalManagement/settings/specialists`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon simple-icon-list",
    title: "menu.hospitalManagement.areasIncome",
    fnOnclick: () => {
      history(
        `${adminRoot}/hospitalManagement/settings/areasIncome`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-journal-medical",
    title: "menu.hospitalManagement.reasonsAdmission",
    fnOnclick: () => {
      history(
        `${adminRoot}/hospitalManagement/settings/reasonsAdmission`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon bi bi-building-check",
    title: "menu.hospitalManagement.rooms",
    fnOnclick: () => {
      history(
        `${adminRoot}/hospitalManagement/settings/rooms`,
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