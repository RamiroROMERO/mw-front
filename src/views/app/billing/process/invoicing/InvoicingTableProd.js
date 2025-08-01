import React from 'react';
import { Row, Form, Button, Table } from 'reactstrap';
import { IntlMessages, formatNumber } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { ContainerWithLabel } from '@/components/containerWithLabel';

const InvoicingTable = (props) => {
  const { invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total,
    fnDeleteProduct } = props;

  return (
    <>
      <Form>
        <Row className="mt-2">
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.title.invoiceDetail">
              <Row>
                <Colxx xxs="12">
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.table.code")}</th>
                        <th>{IntlMessages("page.invoicing.input.descriptionProd")}</th>
                        <th className='d-xxs-none-table-cell'>{IntlMessages("page.invoicing.input.qtyProd")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("page.invoicing.input.priceProd")}</th>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.input.subtotal")}</th>
                        <th className='d-xs-none-table-cell'>{IntlMessages("page.invoicing.input.discValue")}</th>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.input.taxValue")}</th>
                        <th>{IntlMessages("page.invoicing.input.totalProd")}</th>
                        <th>{IntlMessages("page.invoicing.options")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceDetail.map((item, idx) => {
                        return (
                          <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                            <th className='d-md-none-table-cell' scope="row">{item.productCode}</th>
                            <th scope="row">{item.description}</th>
                            <td className='d-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.price)}</td>
                            <td className='d-md-none-table-cell' align='right'>{formatNumber(item.subtotal)}</td>
                            <td className='d-xs-none-table-cell' align='right'>{formatNumber(item.discountValue)}</td>
                            <td className='d-md-none-table-cell' align='right'>{formatNumber(item.taxValue)}</td>
                            <td align='right'>{formatNumber(item.total)}</td>
                            <td align='right'>
                              <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                                onClick={() => { fnDeleteProduct(item) }} key={`buttons-${idx}`}>
                                <i className='bi bi-trash' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
              <Row className="mt-4">
                <Colxx xxs="12">
                  <Table bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th>{IntlMessages("page.invoicing.input.subtotal2")}</th>
                        <th className='d-sm-none-table-cell'>{IntlMessages("page.invoicing.input.discount")}</th>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.input.exempt")}</th>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.input.exonerated")}</th>
                        <th className='d-md-none-table-cell'>{IntlMessages("page.invoicing.input.taxed")}</th>
                        <th>{IntlMessages("page.invoicing.input.taxes")}</th>
                        <th>{IntlMessages("page.invoicing.input.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td align='right'>{formatNumber(subTotalValue)}</td>
                        <td className='d-sm-none-table-cell' align='right'>{formatNumber(discount)}</td>
                        <td className='d-md-none-table-cell' align='right'>{formatNumber(subTotExeValue)}</td>
                        <td className='d-md-none-table-cell' align='right'>{formatNumber(subTotExoValue)}</td>
                        <td className='d-md-none-table-cell' align='right'>{formatNumber(subtotTaxValue)}</td>
                        <td align='right'>{formatNumber(taxValueInvoice)}</td>
                        <td align='right'>{formatNumber(total, "L.")}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Form>
    </>
  )
}

export default InvoicingTable;