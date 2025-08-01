/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  NavLink,
} from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { adminRoot } from '@/constants/defaultValues';
import { request } from '@/helpers/core';
import moment from 'moment'

const NotificationItem = ({ img, title, date, data, setOpen }) => {
  const history = useNavigate();

  const fnOpenProject = () => {
    if (history.location.pathname === `${adminRoot}/production/process/workOrders/projectDetail`) {
      history({
        state: data
      });
      window.location.reload(false);
    } else {
      history.push({
        pathname: `${adminRoot}/production/process/workOrders/projectDetail`,
        state: data
      });
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
      <div className="pl-3 pr-2">
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

  // useEffect(() => {
  //   request.GET('prodProjects/findByNext5Days', (resp) => {
  //     const listProjects = resp.data.map((item) => {
  //       item.title = item.name
  //       item.date = `${item.code} | ${moment(item.startDate).format("DD/MM/YYYY")}`
  //       return item;
  //     });
  //     setDatanotifications(listProjects);
  //   }, (err) => {
  //     console.error(err);
  //   });
  // }, []);

  return (
    <div className="position-relative d-inline-block">
      <UncontrolledDropdown className="dropdown-menu-right" isOpen={openNotifications} toggle={toggle}>
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
