import React from "react";
import { Button, ModalBody, ModalFooter, Row, Label, Input } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages, validFloat, validInt } from "@/helpers/Utils";
import { RadioButton } from "@/components/radioGroup/RadioButton";

const ModalChangePrice = (props) => {
  const { data, setOpen } = props;
  const { typePrice, priceLocalMin, priceLocalMid, priceLocalMax, otherPriceProd, qty, discountPercent, taxPercent,
    onInputDetaChange, setBulkFormDetail } = data;

  const fnSelectPrice = () => {
    let priceProduct = 0;
    if (typePrice === "1") {
      priceProduct = priceLocalMin;
    } else if (typePrice === "2") {
      priceProduct = priceLocalMid;
    } else if (typePrice === "3") {
      priceProduct = priceLocalMax;
    } else {
      priceProduct = otherPriceProd;
    }

    const subtotal2 = validFloat(priceProduct * qty);
    const discount3 = validFloat((discountPercent * subtotal2) / 100);
    const tax2 = validFloat((taxPercent * (subtotal2 - discount3)) / 100);
    const total2 = validFloat((subtotal2 - discount3) + tax2);
    const newPrice = {
      subtotal: subtotal2,
      discountValue: discount3,
      taxValue: tax2,
      total: total2,
      price: priceProduct
    }
    setBulkFormDetail(newPrice);
    setOpen(false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="2" className="mt-2">
            <RadioButton
              id="1"
              name="typePrice"
              value={typePrice}
              onChange={onInputDetaChange}
              label="radio.title.empty"
            />
          </Colxx>
          <Colxx xxs="10">
            <Label className="form-group has-float-label">
              <Input
                value={priceLocalMin}
                id="priceLocalMin"
                name="priceLocalMin"
                onChange={onInputDetaChange}
                disabled
                type="text" />
              <span>
                {IntlMessages("page.invoicing.modal.changePrice.input.priceMinProd")}
              </span>
            </Label>
          </Colxx>
        </Row>
        <Row>
          <Colxx className="mt-2" xxs="2">
            <RadioButton
              id="2"
              name="typePrice"
              value={typePrice}
              onChange={onInputDetaChange}
              label="radio.title.empty"
            />
          </Colxx>
          <Colxx xxs="10">
            <Label className="form-group has-float-label">
              <Input
                value={priceLocalMid}
                id="priceLocalMid"
                name="priceLocalMid"
                onChange={onInputDetaChange}
                disabled
                type="text" />
              <span>
                {IntlMessages("page.invoicing.modal.changePrice.input.priceMedProd")}
              </span>
            </Label>
          </Colxx>
        </Row>
        <Row>
          <Colxx className="mt-2" xxs="2">
            <RadioButton
              id="3"
              name="typePrice"
              value={typePrice}
              onChange={onInputDetaChange}
              label="radio.title.empty"
            />
          </Colxx>
          <Colxx xxs="10">
            <Label className="form-group has-float-label">
              <Input
                value={priceLocalMax}
                id="priceLocalMax"
                name="priceLocalMax"
                onChange={onInputDetaChange}
                disabled
                type="text" />
              <span>
                {IntlMessages("page.invoicing.modal.changePrice.input.priceMaxProd")}
              </span>
            </Label>
          </Colxx>
        </Row>
        <Row>
          <Colxx className="mt-2" xxs="2">
            <RadioButton
              id="4"
              name="typePrice"
              value={typePrice}
              onChange={onInputDetaChange}
              label="radio.title.empty"
            />
          </Colxx>
          <Colxx xxs="10">
            <Label className="form-group has-float-label">
              <Input
                value={otherPriceProd}
                id="otherPriceProd"
                name="otherPriceProd"
                onChange={onInputDetaChange}
                type="text"
                disabled={validInt(typePrice) === 4 ? false : true}
              />
              <span>
                {IntlMessages("page.invoicing.modal.changePrice.input.otherPriceProd")}
              </span>
            </Label>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSelectPrice}><i className="bi bi-check-lg" /> {IntlMessages("button.accept")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalChangePrice;