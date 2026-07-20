import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  NavLink,
} from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { adminRoot } from '@Constants/defaultValues';
import { request } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';

const NotificationItem = ({ img, title, date, data, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const fnOpenProject = () => {
    const projectDetailPath = `${adminRoot}/production/process/workOrders/projectDetail`;
    if (location.pathname === projectDetailPath) {
      navigate(projectDetailPath, { state: data, replace: true });
      window.location.reload(false);
    } else {
      navigate(projectDetailPath, { state: data });
    }
    setOpen(false);
  }
  return (
    <div className="d-flex flex-row mb-3 pb-3 border-bottom">
      {/* <NavLink to={`${adminRoot}/production/process/workOrders`}>
        <img
          src={img}
          alt={title}
          className="img-thumbnail list-thumbnail xsmall border-0 rounded-circle"
        />
      </NavLink> */}
      <div className="ps-3 pe-2">
        <NavLink onClick={fnOpenProject} href="#">
          <p className="font-weight-medium mb-1">{title}</p>
          <p className="text-muted mb-0 text-small">{date}</p>
        </NavLink>
      </div>
    </div>
  );
};

const TopnavNotifications = () => {
  const [dataNotifications, setDatanotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const toggle = () => setOpenNotifications((prevState) => !prevState);

  useEffect(() => {
    request.GET('prodProjects/findByNext5Days', (resp) => {
      const listProjects = resp.data.map((item) => {
        item.title = item.name
        item.date = `${item.code} | ${DateHelper.format(item.startDate, 'DD/MM/YYYY')}`
        return item;
      });
      setDatanotifications(listProjects);
    }, (err) => {
    });
  }, []);

  return (
    <div className="position-relative d-inline-block">
      <UncontrolledDropdown isOpen={openNotifications} toggle={toggle}>
        <DropdownToggle
          className="header-icon notificationButton"
          color="empty"
        >
          <i className="simple-icon-bell" />
          <span className="count">{dataNotifications.length}</span>
        </DropdownToggle>
        <DropdownMenu
          className="position-absolute mt-3 scroll"
          end
          id="notificationDropdown"
        >
          <PerfectScrollbar
            options={{ suppressScrollX: true, wheelPropagation: false }}
          >
            {dataNotifications.map((notification, index) => {
              return <NotificationItem key={index} {...notification} data={notification} setOpen={setOpenNotifications} />;
            })}
          </PerfectScrollbar>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};

export default TopnavNotifications;
