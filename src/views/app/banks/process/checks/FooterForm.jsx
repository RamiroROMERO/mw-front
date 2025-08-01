import React from "react";
import { Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from "@/components/inputFields";
import SearchSelect from "@/components/SearchSelect/SearchSelect";

export const FooterForm = ({ formStateIndex, onInputChangeIndex, listProvider, listCustomer }) => {
  const { totalValue, total, customerId, providerId, diference } = formStateIndex;

  return (
    <Row>
      <Colxx className="order-xss-2 order-md-1" xxs="12" xs="8" sm="6" md="6" lg="8">
        <Row>
          <Colxx xxs="12" xs="12" lg="8">
            <SearchSelect
              name="customerId"
              inputValue={customerId}
              onChange={onInputChangeIndex}
              label="select.customer"
              options={listCustomer}
            />
          </Colxx>
          <Colxx xxs="12" xs="12" lg="8">
            <SearchSelect
              name="providerId"
              inputValue={providerId}
              onChange={onInputChangeIndex}
              label="select.providerId"
              options={listProvider}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx className="order-xss-1 order-2" xxs="12" xs="4" sm="6" md="6" lg="4">
        <Row>
          <Colxx xxs="6" xs="12" sm="6">
            <InputField
              value={totalValue}
              name="totalValue"
              onChange={onInputChangeIndex}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="6" xs="12" sm="6">
            <InputField
              value={total}
              name="total"
              onChange={onInputChangeIndex}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="6" xs="12" sm="6"></Colxx>
          <Colxx xxs="6" xs="12" sm="6">
            <InputField
              value={diference}
              name="diference"
              onChange={onInputChangeIndex}
              label="page.checks.input.diference"
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}
