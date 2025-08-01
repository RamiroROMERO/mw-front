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
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-box-close",
    title: "menu.store",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/store`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-ruler",
    title: "menu.measurementUnits",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/measurementUnits`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-plus-slash-minus",
    title: "menu.conversionFactors",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/conversionFactors`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon iconsminds-basket-items",
    title: "menu.typeProducts",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/typeProducts`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon iconsminds-basket-quantity",
    title: "menu.productsCatalog",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/productsCatalog`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon iconsminds-box-with-folders",
    title: "menu.storesProducts",
    fnOnclick: () => {
      history(
        `${adminRoot}/inventory/settings/storesProducts`,
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