import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Form } from "reactstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { InputField } from "@/components/inputFields";
import { SimpleSelect } from "@/components/simpleSelect";
import { useNavigate } from "react-router-dom";
import { adminRoot } from '@/constants/defaultValues';
import { useForm } from "@/hooks";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import DateCalendar from "@/components/dateCalendar";

const ModalNew = (props) => {
  const { data, setOpen } = props;
  const history = useNavigate();
  const { listCustomers, listManagers, listTypeProducts, listTypeProjects, listDestinations, listStatus, fnGetData, setLoading } = data;
  const [sendForm, setSendForm] = useState(false);

  const newProjectValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    startDate: [(val) => val !== "", "msg.required.input.startDate"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    responsId: [(val) => validInt(val) > 0, "msg.required.select.manager"],
    productTypeId: [(val) => validInt(val) > 0, "msg.required.select.typeProduct"],
    projectTypeId: [(val) => validInt(val) > 0, "msg.required.select.typeProject"],
    destinityId: [(val) => validInt(val) > 0, "msg.required.select.destiny"],
    status: [(val) => validInt(val) > 0, "msg.required.select.status"],
    estimatedValue: [(val) => validInt(val) > 0, "msg.required.input.estimatedValue"],
    estimatedTime: [(val) => validInt(val) > 0, "msg.required.input.estimatedDays"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    destinityId: 0,
    status: 1,
    startDate: '',
    estimatedValue: 0,
    estimatedTime: 0,
    customerId: 0,
    responsId: 0,
    productTypeId: 0,
    projectTypeId: 0
  }, newProjectValid);

  const { id, name, description, destinityId, status, startDate, estimatedValue, estimatedTime, customerId, responsId,
    productTypeId, projectTypeId } = formState;

  const { nameValid, startDateValid, customerIdValid, responsIdValid, productTypeIdValid, projectTypeIdValid,
    destinityIdValid, statusValid, estimatedValueValid, estimatedTimeValid } = formValidation;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      name,
      customerId,
      responsId,
      productTypeId,
      destinityId,
      projectTypeId,
      status,
      startDate,
      estimatedValue,
      estimatedTime,
      description
    }

    setLoading(true);
    request.POST('prodProjects', newData, (resp) => {
      console.log(resp);
      fnGetData();
      setOpen(false);
      history(
        `${adminRoot}/production/process/workOrders/projectDetail`,
        { replace: true, state: resp.data }
      );
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Form>
              <Row>
                <Colxx xxs="12" sm="6">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.workOrders.modal.modalNew.input.name"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6">
                  <DateCalendar
                    name="startDate"
                    value={startDate}
                    label='page.workOrders.modal.modalNew.input.startDate'
                    onChange={onInputChange}
                    invalid={sendForm && !!startDateValid}
                    feedbackText={sendForm && (startDateValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" sm="6">
                  <SearchSelect
                    name="customerId"
                    label="page.workOrders.modal.modalNew.select.customer"
                    onChange={onInputChange}
                    inputValue={customerId}
                    options={listCustomers}
                    invalid={sendForm && !!customerIdValid}
                    feedbackText={sendForm && (customerIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6">
                  <SearchSelect
                    label="page.workOrders.modal.modalNew.select.manager"
                    name="responsId"
                    inputValue={responsId}
                    options={listManagers}
                    onChange={onInputChange}
                    invalid={sendForm && !!responsIdValid}
                    feedbackText={sendForm && (responsIdValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" sm="6">
                  <SearchSelect
                    name="productTypeId"
                    inputValue={productTypeId}
                    onChange={onInputChange}
                    options={listTypeProducts}
                    label="page.workOrders.modal.modalNew.select.typeProduct"
                    invalid={sendForm && !!productTypeIdValid}
                    feedbackText={sendForm && (productTypeIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6">
                  <SearchSelect
                    name="projectTypeId"
                    inputValue={projectTypeId}
                    label="page.workOrders.modal.modalNew.select.typeProject"
                    onChange={onInputChange}
                    options={listTypeProjects}
                    invalid={sendForm && !!projectTypeIdValid}
                    feedbackText={sendForm && (projectTypeIdValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" sm="6">
                  <SearchSelect
                    inputValue={destinityId}
                    name="destinityId"
                    onChange={onInputChange}
                    label="page.workOrders.modal.modalNew.select.destiny"
                    options={listDestinations}
                    invalid={sendForm && !!destinityIdValid}
                    feedbackText={sendForm && (destinityIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6">
                  <SimpleSelect
                    value={status}
                    name="status"
                    onChange={onInputChange}
                    label="page.workOrders.modal.modalNew.select.status"
                    options={listStatus}
                    invalid={sendForm && !!statusValid}
                    feedbackText={sendForm && (statusValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" sm="6">
                  <InputField
                    value={estimatedValue}
                    name="estimatedValue"
                    onChange={onInputChange}
                    type="number"
                    label="page.workOrders.modal.modalNew.input.estimatedValue"
                    invalid={sendForm && !!estimatedValueValid}
                    feedbackText={sendForm && (estimatedValueValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6">
                  <InputField
                    value={estimatedTime}
                    name="estimatedTime"
                    onChange={onInputChange}
                    type="number"
                    label="page.workOrders.modal.modalNew.input.estimatedDays"
                    invalid={sendForm && !!estimatedTimeValid}
                    feedbackText={sendForm && (estimatedTimeValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <InputField
                    value={description}
                    name="description"
                    onChange={onInputChange}
                    type="textarea"
                    label="page.workOrders.modal.modalNew.select.description"
                  />
                </Colxx>
              </Row>
            </Form>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save" />
          {IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalNew;