import { Row, Form, Button, Table } from 'reactstrap';
import { useIntl } from 'react-intl';
import { formatNumber } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const InvoicingTable = (props) => {
  // Un solo hook: antes cada texto llamaba a `IntlMessages` (un hook) y varios dentro de condiciones y de un `.map`, lo que cambiaba el orden de los hooks.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total,
    fnDeleteProduct, isInvoiceSaved, hasDateOutControl, fnOpenChangeProduct, canChangeProduct } = props;

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
                        <th className='d-md-none-table-cell'>{t("page.invoicing.table.code")}</th>
                        <th>{t("page.invoicing.input.descriptionProd")}</th>
                        <th className='d-xxs-none-table-cell'>{t("page.invoicing.input.qtyProd")}</th>
                        <th className='d-xs-none-table-cell'>{t("page.invoicing.input.priceProd")}</th>
                        <th className='d-md-none-table-cell'>{t("page.invoicing.input.subtotal")}</th>
                        <th className='d-xs-none-table-cell'>{t("page.invoicing.input.discValue")}</th>
                        <th className='d-md-none-table-cell'>{t("page.invoicing.input.taxValue")}</th>
                        <th>{t("page.invoicing.input.totalProd")}</th>
                        {hasDateOutControl && (
                          <>
                            <th className='d-md-none-table-cell'>{t("page.invoicing.input.lotCode")}</th>
                            <th className='d-md-none-table-cell'>{t("page.invoicing.input.dateOut")}</th>
                          </>
                        )}
                        <th>{t("page.invoicing.options")}</th>
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
                            {hasDateOutControl && (
                              <>
                                <td className='d-md-none-table-cell'>{item.lotCode}</td>
                                <td className='d-md-none-table-cell'>{item.dateOut}</td>
                              </>
                            )}
                            <td align='right'>
                              {!isInvoiceSaved && (
                                <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                                  onClick={() => { fnDeleteProduct(item) }} key={`buttons-${idx}`}>
                                  <i className='bi bi-trash' />
                                </Button>
                              )}
                              {isInvoiceSaved && canChangeProduct && (
                                <Button type="button" className="btn-circle-table" color="outline-primary" title={t("page.invoicing.modal.changeProduct.title")}
                                  onClick={() => { fnOpenChangeProduct(item) }} key={`buttons-change-${idx}`}>
                                  <i className='bi bi-arrow-left-right' />
                                </Button>
                              )}
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
                        <th>{t("page.invoicing.input.subtotal2")}</th>
                        <th className='d-sm-none-table-cell'>{t("page.invoicing.input.discount")}</th>
                        <th className='d-md-none-table-cell'>{t("page.invoicing.input.exempt")}</th>
                        <th className='d-md-none-table-cell'>{t("page.invoicing.input.exonerated")}</th>
                        <th className='d-md-none-table-cell'>{t("page.invoicing.input.taxed")}</th>
                        <th>{t("page.invoicing.input.taxes")}</th>
                        <th>{t("page.invoicing.input.total")}</th>
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