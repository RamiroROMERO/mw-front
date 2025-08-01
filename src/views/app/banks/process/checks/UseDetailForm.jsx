import React from 'react';
import { Row, Button, Table } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields'
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { IntlMessages } from "@/helpers/Utils";

export const UseDetailForm = ({ formStateDetail, onInputChangeDetail, listAccount, formValidationDetail, sendFormDetail, isFormValidDetail, setSendFormDetail }) => {
  const { idCtaCont, valueDebe, valueHaber, numberLine, referenceCode, customerId, providerId, overView } = formStateDetail;
  const { idCtaContValid } = formValidationDetail;

  const fnAddItem = () => {
    setSendFormDetail(true)
    if (!isFormValidDetail) {
      return;
    }
  }

  return (
    <>
      <Row className='mb-2'>
        <Colxx xs="12">
          <ContainerWithLabel label="page.check.title.detalle">
            <Row>
              <Colxx xxs="12" xs="12" sm="6" lg="6">
                <SearchSelect
                  name="idCtaCont"
                  onChange={onInputChangeDetail}
                  inputValue={idCtaCont}
                  type="text"
                  label="select.accountId"
                  options={listAccount}
                  invalid={sendFormDetail && !!idCtaContValid}
                  feedbackText={sendFormDetail && idCtaContValid || null}
                />
              </Colxx>
              <Colxx xxs="6" xs="6" sm="3" lg="3">
                <InputField
                  name="valueDebe"
                  onChange={onInputChangeDetail}
                  value={valueDebe}
                  type="text"
                  label="page.checks.input.valueDebe"
                />
              </Colxx>
              <Colxx xxs="6" xs="6" sm="3" lg="3">
                <InputField
                  name="valueHaber"
                  onChange={onInputChangeDetail}
                  value={valueHaber}
                  type="text"
                  label="page.checks.input.valueHaber"
                />
              </Colxx>
              <Colxx xxs="12" md="6">
                <InputField
                  name="overView"
                  onChange={onInputChangeDetail}
                  value={overView}
                  type="textarea"
                  label="page.checks.input.overView"
                />
              </Colxx>
              <Colxx xxs="6" md="3">
                <InputField
                  name="referenceCode"
                  onChange={onInputChangeDetail}
                  value={referenceCode}
                  type="text"
                  label="page.checks.input.referenceCode"
                />
              </Colxx>
              <Colxx align="right">
                <Button color="primary" title={IntlMessages("button.add")}
                  onClick={() => { fnAddItem() }}>
                  <i className='bi bi-plus' /> {IntlMessages("button.add")}
                </Button>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Table bordered hover>
            <thead>
              <tr>
                <th className='d-xs-none-table-cell'>{IntlMessages("page.checks.table.Check")}</th>
                <th>{IntlMessages("page.checks.table.account")}</th>
                <th>{IntlMessages("page.checks.input.description")}</th>
                <th className='d-sm-none-table-cell'>{IntlMessages("page.checks.input.debito")}</th>
                <th className='d-sm-none-table-cell'>{IntlMessages("page.checks.input.credito")}</th>
                <th>{IntlMessages("table.column.options")}</th>
              </tr>
            </thead>
          </Table>
        </Colxx>
      </Row>
    </>
  )
}
