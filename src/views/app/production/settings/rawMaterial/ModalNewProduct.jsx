import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Form } from "reactstrap";
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { InputField } from "@/components/inputFields";
import { Checkbox } from "@/components/checkbox";
import { useForm } from "@/hooks";

const ModalNewProduct = (props) => {
  const { setOpen, data } = props;
  const { fnGetData, fnGetProducts, setLoading } = data;
  const [sendForm, setSendForm] = useState(false);

  const rawMaterialValid = {
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    qtyInit: 0,
    costValue: 0,
    status: true
  }, rawMaterialValid);

  const { id, name, description, qtyInit, costValue, status } = formState;

  const { nameValid } = formValidation;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      name,
      description,
      initialValue: qtyInit,
      costValue,
      status
    }
    setLoading(true);
    request.POST('prodProducts', newData, (resp) => {
      fnGetData();
      fnGetProducts();
      setSendForm(false);
      setOpen(false);
      setLoading(false);
    }, (err) => {
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
                <Colxx xxs="12">
                  <InputField
                    value={name}
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.name"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <InputField
                    value={description}
                    name="description"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.description"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="6">
                  <InputField
                    value={qtyInit}
                    name="qtyInit"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.qtyInit"
                  />
                </Colxx>
                <Colxx xxs="6">
                  <InputField
                    value={costValue}
                    name="costValue"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.costValue"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <Checkbox
                    onChange={onInputChange}
                    name="status"
                    value={status}
                    label="page.rawMaterial.check.status"
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

export default ModalNewProduct;