import React from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { InputField } from "@/components/inputFields";
import { ContainerWithLabel } from "@/components/containerWithLabel";

const ModalDeliveryDoc = (props) => {
  const { data, setOpen } = props;
  const { id, customerId, listCustomers, setLoading } = data;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const filterCustomer = listCustomers.filter((item) => {
    return item.id === customerId;
  });

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    rtn: filterCustomer.length > 0 ? filterCustomer[0].rtn : '',
    phone: "",
    name: filterCustomer.length > 0 ? filterCustomer[0].name : '',
    address: "",
    notes: ""
  });

  const { rtn, phone, name, address, notes } = formState;

  const fnPrintDeliveryDoc = () => {
    const dataExport = {
      id,
      rtn,
      phone,
      name,
      address,
      notes,
      userName: userData.name
    }
    request.GETPdf('billing/process/invoices/exportPDFDeliveryDoc', dataExport, 'Documento de Entrega.pdf', (err) => {
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
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.modal.deliveryDoc.title.customer">
              <Row>
                <Colxx xxs="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    disabled
                    label="page.invoicing.modal.deliveryDoc.input.name"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={rtn}
                    name="rtn"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.deliveryDoc.input.rtn"
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <InputField
                    value={phone}
                    name="phone"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.deliveryDoc.input.phone"
                  />
                </Colxx>
                <Colxx xxs="12">
                  <InputField
                    value={address}
                    name="address"
                    onChange={onInputChange}
                    type="textarea"
                    label="page.invoicing.modal.deliveryDoc.input.address"
                  />
                </Colxx>
                <Colxx xxs="12">
                  <InputField
                    value={notes}
                    name="notes"
                    onChange={onInputChange}
                    type="textarea"
                    label="page.invoicing.modal.deliveryDoc.input.notes"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnPrintDeliveryDoc}><i className="iconsminds-printer" /> {IntlMessages("button.print")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalDeliveryDoc;