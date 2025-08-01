import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Label, Input } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { useHistory } from "react-router-dom";
import { adminRoot } from '@/constants/defaultValues';
import moment from 'moment'

const ModalEdit = (props) => {
  const { data, setOpen } = props;
  const { currentItem } = data;
  const history = useHistory();
  const [name, setName] = useState(currentItem.name ? currentItem.name : '');
  const [customer, setCustomer] = useState(currentItem.facCliente ? currentItem.facCliente.nomcli : '');
  const [startDate, setStartDate] = useState(currentItem.startDate ? moment(currentItem.startDate).format("DD/MM/YYYY") : '');
  const [status, setStatus] = useState(currentItem.prodStep ? currentItem.prodStep.name : '');

  const today = moment();
  const dateStart = moment(currentItem.startDate);
  const daysDiff = today.diff(dateStart, 'days');
  let timeLeft = 0;
  if (currentItem.status === 5) {
    timeLeft = 0;
  } else {
    timeLeft = currentItem.estimatedTime - daysDiff;
  }

  const fnViewProject = () => {
    history.push({
      pathname: `${adminRoot}/production/process/workOrders/projectDetail`,
      state: currentItem
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Label className="form-group has-float-label">
              <Input
                value={name}
                id="name"
                name="name"
                disabled
                type="text" />
              <span>
                {IntlMessages("page.start.projectsCalendar.modal.viewProject.input.name")}
              </span>
            </Label>
          </Colxx>
          <Colxx xxs="12">
            <Label className="form-group has-float-label">
              <Input
                value={customer}
                id="customer"
                name="customer"
                disabled
                type="text" />
              <span>
                {IntlMessages("page.start.projectsCalendar.modal.viewProject.select.customer")}
              </span>
            </Label>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="4">
            <Label className="form-group has-float-label">
              <Input
                value={startDate}
                id="startDate"
                name="startDate"
                disabled
                type="text" />
              <span>
                {IntlMessages("page.start.projectsCalendar.modal.viewProject.input.startDate")}
              </span>
            </Label>
          </Colxx>
          <Colxx xxs="4">
            <Label className="form-group has-float-label">
              <Input
                value={timeLeft}
                id="timeLeft"
                name="timeLeft"
                disabled
                type="text" />
              <span>
                {IntlMessages("page.start.projectsCalendar.modal.viewProject.input.timeLeft")}
              </span>
            </Label>
          </Colxx>
          <Colxx xxs="4">
            <Label className="form-group has-float-label">
              <Input
                value={status}
                id="status"
                name="status"
                disabled
                type="text" />
              <span>
                {IntlMessages("page.start.projectsCalendar.modal.viewProject.input.status")}
              </span>
            </Label>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnViewProject}><i className="bi bi-clipboard-check" />
          {` ${IntlMessages("button.viewProject")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEdit;