import React from 'react';
import { useNavigate } from "react-router-dom"
import { Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import IconCard from '@Components/cards/IconCard';
import { adminRoot } from '@Constants/defaultValues';

const Process = (props) => {
  const { match } = props;
  const history = useNavigate();
  const propsToCard = [{
    id: 1,
    icon: "large-icon iconsminds-male-female",
    title: "menu.employees",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/employees`,
        { replace: true }
      );
    }
  },
  {
    id: 2,
    icon: "large-icon bi bi-person-badge",
    title: "menu.printCarnet",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/printCarnet`,
        { replace: true }
      );
    }
  },
  {
    id: 3,
    icon: "large-icon bi bi-file-earmark-check",
    title: "menu.permissions",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/permissions`,
        { replace: true }
      );
    }
  },
  {
    id: 4,
    icon: "large-icon bi bi-calendar4-week",
    title: "menu.vacations",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/vacations`,
        { replace: true }
      );
    }
  },
  {
    id: 5,
    icon: "large-icon bi bi-clipboard-pulse",
    title: "menu.accidents",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/accidents`,
        { replace: true }
      );
    }
  },
  {
    id: 6,
    icon: "large-icon bi bi-file-earmark-medical",
    title: "menu.incapacities",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/incapacities`,
        { replace: true }
      );
    }
  },
  {
    id: 7,
    icon: "large-icon bi bi-exclamation-square",
    title: "menu.admonitions",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/admonitions`,
        { replace: true }
      );
    }
  },
  {
    id: 8,
    icon: "large-icon bi bi-file-earmark-text",
    title: "menu.proofWork",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/proofWork`,
        { replace: true }
      );
    }
  },
  {
    id: 9,
    icon: "large-icon bi bi-clipboard-check",
    title: "menu.projects",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/projects`,
        { replace: true }
      );
    }
  },
  // {
  //   id: 10,
  //   icon: "large-icon bi bi-file-text",
  //   title: "menu.dailyReport",
  //   fnOnclick: () => {
  //     history(
  //       `${adminRoot}/humanResources/process/dailyReport`,
  //       { replace: true }
  //     );
  //   }
  // },
  // {
  //   id: 11,
  //   icon: "large-icon bi bi-cash",
  //   title: "menu.dailyPayroll",
  //   fnOnclick: () => {
  //     history(
  //       `${adminRoot}/humanResources/process/dailyPayroll`,
  //       { replace: true }
  //     );
  //   }
  // },
  // {
  //   id: 12,
  //   icon: "large-icon bi bi-currency-dollar",
  //   title: "menu.seventhDay",
  //   fnOnclick: () => {
  //     history(
  //       `${adminRoot}/humanResources/process/seventhDay`,
  //       { replace: true }
  //     );
  //   }
  // },
  {
    id: 13,
    icon: "large-icon bi bi-dash-circle",
    title: "menu.deductions",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/deductions`,
        { replace: true }
      );
    }
  },
  {
    id: 14,
    icon: "large-icon bi bi-cash-stack",
    title: "menu.resumePayroll",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/resumePayroll`,
        { replace: true }
      );
    }
  },
  // {
  //   id: 15,
  //   icon: "large-icon bi bi-cash-coin",
  //   title: "menu.biweeklyPayroll",
  //   fnOnclick: () => {
  //     history(
  //       `${adminRoot}/humanResources/process/biweeklyPayroll`,
  //       { replace: true }
  //     );
  //   }
  // },
  {
    id: 16,
    icon: "large-icon bi bi-card-heading",
    title: "menu.paymentPlans",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/paymentPlans`,
        { replace: true }
      );
    }
  },
  // {
  //   id: 17,
  //   icon: "large-icon bi bi-dash-circle",
  //   title: "menu.deductionBiweekly",
  //   fnOnclick: () => {
  //     history(
  //       `${adminRoot}/humanResources/process/deductionBiweekly`,
  //       { replace: true }
  //     );
  //   }
  // },
  {
    id: 18,
    icon: "large-icon bi bi-cash-coin",
    title: "menu.thirteenthMonth",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/thirteenthMonth`,
        { replace: true }
      );
    }
  },
  {
    id: 19,
    icon: "large-icon bi bi-cash-coin",
    title: "menu.fourteenthMonth",
    fnOnclick: () => {
      history(
        `${adminRoot}/humanResources/process/fourteenthMonth`,
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
  );
}
export default Process;