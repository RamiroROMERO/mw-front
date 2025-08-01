import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Card, CardBody, Row, CardTitle, Table } from "reactstrap";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { IntlMessages, getDirection } from "@/helpers/Utils";
import { Colxx } from "@/components/common/CustomBootstrap";
import Breadcrumb from "@/containers/navs/Breadcrumb";
import { request } from "@/helpers/core";
import CalendarToolbar from '@/components/CalendarToolbar';
import 'moment/locale/es';
import Modal from "@/components/modal";
import ModalViewProject from "./ModalViewProject";

const Start = ({ match, loaded }) => {
  const localizer = momentLocalizer(moment);
  const [dataCalendar, setDataCalendar] = useState([]);
  const [dataProjectsStatus, setDataProjectsStatus] = useState([]);
  const [openModalProject, setOpenModalProject] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.home"));
    dispatch(onBreadcrumbEdit(adminRoot))
  }, [])

  const fnViewProject = (event) => {
    setCurrentItem(event);
    setOpenModalProject(true);
  }

  useEffect(() => {
    request.GET('prodProjects', (resp) => {
      let colorStatus = "";
      const data = resp.data.map((item) => {
        if (item.status === 1) {
          colorStatus = "#ffbd00";
        } else if (item.status === 2) {
          colorStatus = "#73c2fb";
        } else if (item.status === 3) {
          colorStatus = "#008ecc";
        } else if (item.status === 4) {
          colorStatus = "#17a2b8";
        } else if (item.status === 5) {
          colorStatus = "#28a745";
        } else {
          colorStatus = "";
        }
        const datestart = new Date(`${item.startDate}T12:00:00Z`);
        let dateEnd = datestart.setDate(datestart.getDate() + item.estimatedTime);
        dateEnd = new Date(dateEnd);
        item.title = item.name
        item.start = dateEnd
        item.end = dateEnd
        item.eventColor = colorStatus
        return item;
      });
      setDataCalendar(data);
    }, (err) => {
      console.error(err);
    });
    request.GET('prodProjects/findGroupByStatus', (resp) => {
      const data = resp.data.map((item) => {
        item.name = item.prodStep.name;
        return item;
      });
      setDataProjectsStatus(data);
    }, (err) => {
      console.error(err);
    });
  }, []);

  const propsToModalProjects = {
    ModalContent: ModalViewProject,
    title: "page.start.projectsCalendar.modal.viewProject.title",
    open: openModalProject,
    setOpen: setOpenModalProject,
    maxWidth: 'md',
    data: {
      currentItem
    }
  }

  return (
    <>
      <Breadcrumb />
      <Row>
        <Colxx xxs="12" lg="8" xl="9" className="mb-4">
          <Card>
            <CardBody>
              <CardTitle>
                {IntlMessages("page.start.projectsCalendar")}
              </CardTitle>
              <Calendar
                localizer={localizer}
                onSelectEvent={fnViewProject}
                style={{ minHeight: '500px' }}
                events={dataCalendar}
                rtl={getDirection().isRtl}
                views={['month']}
                components={{
                  toolbar: CalendarToolbar,
                }}
                eventPropGetter={(event) => {
                  const backgroundColor = event.eventColor ? event.eventColor : "#28a745";
                  return { style: { backgroundColor } }
                }}
              />
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="4" xl="3" className="mb-4">
          <Card>
            <CardBody>
              <CardTitle>
                {IntlMessages("page.start.projectsByStatus")}
              </CardTitle>
              <Row>
                <Colxx xxs="12">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>{IntlMessages("page.workOrders.detail.table.name")}</th>
                        <th style={{ textAlign: "center" }}>{IntlMessages("page.workOrders.detail.table.qty")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataProjectsStatus.map((item, idx) => {
                        return (
                          <tr id={`tr-table-dataProjectsStatus-${item.id}`} key={idx}>
                            <th scope="row">{item.name}</th>
                            <td style={{ textAlign: "center" }}>{item.qty} </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalProjects} />
    </>
  );
};
export default Start;
