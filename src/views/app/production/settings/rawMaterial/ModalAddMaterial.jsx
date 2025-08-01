import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Form } from "reactstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from "@/components/inputFields";
import { request } from '@/helpers/core';
import { useForm } from "@/hooks";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import moment from 'moment'

const ModalAddMaterial = (props) => {
  const { setOpen, data } = props;
  const { fnGetData, setLoading, listProducts, type } = data;
  const [sendForm, setSendForm] = useState(false);

  const rawMaterialValid = {
    productId: [(val) => validInt(val) > 0, "msg.required.select.product"],
    qty: [(val) => validInt(val) > 0, "msg.required.input.qty"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    productId: 0,
    notes: '',
    qty: 0
  }, rawMaterialValid);

  const { id, productId, notes, qty } = formState;

  const { productIdValid, qtyValid } = formValidation;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    let qtyIn = 0;
    let qtyOut = 0;
    if (type === 1) {
      qtyIn = validInt(qty)
    } else if (type === 2) {
      qtyOut = validInt(qty)
    }
    const newData = {
      productId,
      notes,
      qtyIn,
      qtyOut,
      date: moment(new Date()).format("YYYY-MM-DD")
    }
    setLoading(true);
    request.POST('prodRMStocks', newData, (resp) => {
      console.log(resp);
      fnGetData();
      setOpen(false);
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
                <Colxx xxs="12">
                  <SearchSelect
                    name="productId"
                    inputValue={productId}
                    onChange={onInputChange}
                    options={listProducts}
                    label="page.rawMaterial.select.product"
                    invalid={sendForm && !!productIdValid}
                    feedbackText={sendForm && (productIdValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12">
                  <InputField
                    value={notes}
                    name="notes"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.observations"
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="6">
                  <InputField
                    value={qty}
                    name="qty"
                    onChange={onInputChange}
                    type="text"
                    label="page.rawMaterial.input.qty"
                    invalid={sendForm && !!qtyValid}
                    feedbackText={sendForm && (qtyValid || null)}
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

export default ModalAddMaterial;