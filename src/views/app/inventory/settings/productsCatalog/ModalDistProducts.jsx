import React, { useState } from "react";
import { Button, Card, CardBody, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";
import UseModalDistProducts from "./useModalDistProducts";
import { SimpleSelect } from "@/components/simpleSelect";
import { InputField } from "@/components/inputFields";
import { Checkbox } from "@/components/checkbox";


const ModalDistProducts = (props) => {

  const { data, setOpen } = props;
  const { dataProducts, setLoading, productCode, productName, listPackagingUnits } = data;

  const {table, formState, formValidation, onInputChange, sendForm, fnSaveDetaItem, fnClearDetaItem} = UseModalDistProducts({setLoading, productCode, productName});

  const {undOut, valChange, localMinPrice, localMedPrice, localMaxPrice, foranMinPrice, foranMedPrice, foranMaxPrice, isDefault, status } = formState

  const {undOutValid, valChangeValid, localMinPriceValid, localMedPriceValid, localMaxPriceValid, foranMinPriceValid, foranMedPriceValid, foranMaxPriceValid} = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("select.productId")}</strong></p>
            <h6>{`${productCode} - ${productName}`}</h6>
          </Colxx>
        </Row>
        <hr/>
        <Card style={{marginBottom:'8px'}}>
          <CardBody>
          <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("page.productsCatalog.modal.distProduct.undOut")}</strong></p>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} xs={5}>
            <SimpleSelect
              label="page.productsCatalog.modal.distProduct.table.column.measureUnit"
              id="undOut"
              name="undOut"
              value={undOut}
              options={listPackagingUnits}
              onChange={onInputChange}
              invalid={sendForm && !!undOutValid}
              feedbackText={sendForm && (undOutValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={3}>
            <InputField
            label="page.productsCatalog.modal.distProduct.table.column.baseValue"
            id="valChange"
            name="valChange"
            type="number"
            value={valChange}
            onChange={onInputChange}
            invalid={sendForm && !!valChangeValid}
            feedbackText ={sendForm &&(valChangeValid|| null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={4} className="div-action-button-container">
            <Checkbox
              label="check.status"
              id="status"
              name="status"
              value={status}
              onChange={onInputChange}
              disabled={isDefault?true:false}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} lg={6}>
            <Row>
              <Colxx xxs={12}>
              <p><strong>{IntlMessages("page.productsCatalog.modal.distProduct.localPrices")}</strong></p>
              </Colxx>
            </Row>
            <Row>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.minPrice"
                name="localMinPrice"
                value={localMinPrice}
                onChange={onInputChange}
                invalid={sendForm && !!localMinPriceValid}
                feedbackText ={sendForm &&(localMinPriceValid|| null)}
              />
            </Colxx>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.medPrice"
                name="localMedPrice"
                value={localMedPrice}
                onChange={onInputChange}
                invalid={sendForm && !!localMedPriceValid}
                feedbackText ={sendForm &&(localMedPriceValid|| null)}
              />
            </Colxx>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.maxPrice"
                name="localMaxPrice"
                value={localMaxPrice}
                onChange={onInputChange}
                invalid={sendForm && !!localMaxPriceValid}
                feedbackText ={sendForm &&(localMaxPriceValid|| null)}
              />
            </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs={12} lg={6}>
            <Row>
              <Colxx xxs={12}>
              <p><strong>{IntlMessages("page.productsCatalog.modal.distProduct.foranPrices")}</strong></p>
              </Colxx>
            </Row>
            <Row>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.minPrice"
                name="foranMinPrice"
                value={foranMinPrice}
                onChange={onInputChange}
                invalid={sendForm && !!foranMinPriceValid}
                feedbackText ={sendForm &&(foranMinPriceValid|| null)}
              />
            </Colxx>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.medPrice"
                name="foranMedPrice"
                value={foranMedPrice}
                onChange={onInputChange}
                invalid={sendForm && !!foranMedPriceValid}
                feedbackText ={sendForm &&(foranMedPriceValid|| null)}
              />
            </Colxx>
            <Colxx xxs={12} sm={4}>
              <InputField
                label="page.productsCatalog.modal.distProduct.table.column.maxPrice"
                name="foranMaxPrice"
                value={foranMaxPrice}
                onChange={onInputChange}
                invalid={sendForm && !!foranMaxPriceValid}
                feedbackText ={sendForm &&(foranMaxPriceValid|| null)}
              />
            </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} className="div-action-button-container">
            <Button color="secondary" onClick={fnClearDetaItem}><i className="bi bi-stars"></i> {` ${IntlMessages('button.clear')}`} </Button>
            <Button color="primary" onClick={fnSaveDetaItem}><i className="iconsminds-save"></i> {` ${IntlMessages('button.save')}`} </Button>
          </Colxx>
        </Row>
        </CardBody>
        </Card>
        <Row>
          <Colxx xxs="12">
            <ReactTable
              {...table}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalDistProducts;