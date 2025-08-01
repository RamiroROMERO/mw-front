import React from 'react'
import { Row, Button, Table } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { IntlMessages, formatNumber } from "@/helpers/Utils";
import { ContainerWithLabel } from '@/components/containerWithLabel';

export const RequestDetail = (props) => {

  const { formStateDetail, fnViewCxp, onInputChangeDetail } = props;

  const { otherSurcharges1, valueOther1, otherSurcharges2, valueOther2, total } = formStateDetail
  return (
    <Row>
      <Colxx xs="12">
        <Row className='mb-2'>
          <Colxx xs="12" xss="12" lg="12">
            <ContainerWithLabel label="page.checkRequest.title.detailRequest">
              <Row className='mb-3'>
                <Colxx align="right">
                  <Button color="primary" onClick={() => { fnViewCxp() }}>
                    <i className='bi bi-plus' /> {IntlMessages("button.addInvoice")}
                  </Button>
                </Colxx>
              </Row>
              <Row className='mb-3'>
                <Colxx xs="12" xss="12" lg="12">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>{IntlMessages("table.column.date")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("table.column.provider")}</th>
                        <th className='d-sm-none-table-cell'>{IntlMessages("table.column.noInvoice")}</th>
                        <th>{IntlMessages("table.column.value")}</th>
                        <th>{IntlMessages("table.column.options")}</th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
              <Row>
                <Colxx xss="12" xs="8" sm="8" lg="8">
                  <InputField
                    name="otherSurcharges1"
                    value={otherSurcharges1}
                    onChange={onInputChangeDetail}
                    label="input.otherCharges"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="4" sm="4" lg="4">
                  <InputField
                    name="valueOther1"
                    value={valueOther1}
                    onChange={onInputChangeDetail}
                    label="input.checkRequest.input.valueOther"
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="8" sm="8" lg="8">
                  <InputField
                    name="otherSurcharges2"
                    value={otherSurcharges2}
                    onChange={onInputChangeDetail}
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="4" sm="4" lg="4">
                  <InputField
                    name="valueOther2"
                    value={valueOther2}
                    onChange={onInputChangeDetail}
                    type="text"
                  />
                </Colxx>
                <Colxx xss="12" xs="8" sm="8" lg="8"></Colxx>
                <Colxx xss="12" xs="4" sm="4" lg="4">
                  <InputField
                    name="total"
                    value={total}
                    onChange={onInputChangeDetail}
                    label="input.total"
                    type="text"
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xs="12" xss="12" lg="12">
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}
