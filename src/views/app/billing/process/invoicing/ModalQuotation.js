import React from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { ContainerWithLabel } from "@/components/containerWithLabel";
import { InputField } from "@/components/inputFields";

const ModalQuotation = (props) => {
  const { data, setOpen } = props;
  const { id, dateInProcess, customerDNI, customerName, setLoading } = data;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    numQuotation: 0,
    rtn: customerDNI,
    phone: "",
    name: customerName,
    address: "",
    seller: "",
    deliveryTime: 0,
    paymentMethod: ""
  });

  const { numQuotation, rtn, phone, name, address, seller, deliveryTime, paymentMethod } = formState;

  const fnPrintQuotation = () => {
    const dataExport = {
      id,
      dateInProcess,
      numQuotation,
      rtn,
      phone,
      name,
      address,
      seller,
      deliveryTime,
      paymentMethod,
      userName: userData.name
    }
    request.GETPdf('billing/process/invoices/exportPDFQuotation', dataExport, 'Cotizacion.pdf', (err) => {
      console.error(err);
      setLoading(false);
    });
    onResetForm();
    setOpen(false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" xs="9"> </Colxx>
          <Colxx xxs="12" xs="3">
            <InputField
              value={numQuotation}
              name="numQuotation"
              onChange={onInputChange}
              type="text"
              label="page.invoicing.modal.generateQuotation.input.numQuotation"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.modal.generateQuotation.title.customer">
              <Row>
                <Colxx xxs="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.name"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={rtn}
                    name="rtn"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.rtn"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={phone}
                    name="phone"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.phone"
                  />
                </Colxx>
                <Colxx xxs="12">
                  <InputField
                    value={address}
                    name="address"
                    onChange={onInputChange}
                    type="textarea"
                    label="page.invoicing.modal.generateQuotation.input.address"
                  />
                </Colxx>
                <Colxx xxs="12">
                  <InputField
                    value={seller}
                    name="seller"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.seller"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.modal.generateQuotation.title.conditions">
              <Row>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={deliveryTime}
                    name="deliveryTime"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.deliveryTime"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={paymentMethod}
                    name="paymentMethod"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateQuotation.input.paymentMethod"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintQuotation}><i className="iconsminds-printer" /> {IntlMessages("button.print")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalQuotation;