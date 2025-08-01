import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import IconCard from '@/components/cards/IconCard';
import { adminRoot } from '@/constants/defaultValues';

const Production = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-files",
    title: "menu.taxDocuments",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/taxDocuments`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon iconsminds-file",
    title: "menu.internalDocuments",
    fnOnclick: () => {
      history(
        `${adminRoot}/accounting/settings/itemsCodes`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-building",
    title: "menu.companyInformation",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/companyInformation`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon iconsminds-coins-2",
    title: "menu.currency",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/currency`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon iconsminds-conference",
    title: "menu.providerTypes",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/providerTypes`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon iconsminds-business-man-woman",
    title: "menu.customerTypes",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/customerTypes`,
        { replace: true }
      );
    }
  },
  {
    id: 7,
    icon: "large-icon iconsminds-building",
    title: "menu.intercompanies",
    fnOnclick: () => {
      history(
        `${adminRoot}/settings/intercompanies`,
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
export default Production;