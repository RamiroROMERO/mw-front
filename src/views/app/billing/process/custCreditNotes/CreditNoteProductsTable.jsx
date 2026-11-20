import { Row, Form, Button, Table, Input } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const CreditNoteProductsTable = (props) => {
  const { detail2, originInvoice, fnSeekOriginInvoice, onChangeDetail2Qty, fnDeleteDetail2Row, disabled } = props;

  // IntlMessages es un hook: todos los textos se piden aquí arriba, nunca dentro de una condición ni de un map (orden de hooks).
  const textSelectInvoice = IntlMessages('button.selectInvoice');
  const textOriginInvoice = IntlMessages('page.custCreditNotes.input.originInvoice');
  const textCode = IntlMessages('page.invoicing.table.code');
  const textDescription = IntlMessages('page.invoicing.input.descriptionProd');
  const textQtyInvoiced = IntlMessages('page.custCreditNotes.table.qtyInvoiced');
  const textQtyReturn = IntlMessages('page.custCreditNotes.table.qtyReturn');
  const textSubtotal = IntlMessages('page.invoicing.input.subtotal');
  const textDiscount = IntlMessages('page.invoicing.input.discValue');
  const textTax = IntlMessages('page.invoicing.input.taxValue');
  const textTotalProd = IntlMessages('page.invoicing.input.totalProd');
  const textOptions = IntlMessages('page.invoicing.options');
  const textTotal = IntlMessages('page.invoicing.input.total');

  const total = detail2.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="4">
          {!disabled && (
            <Button color="primary" onClick={fnSeekOriginInvoice}>
              <i className="bi bi-file-earmark-post" /> {textSelectInvoice}
            </Button>
          )}
        </Colxx>
        <Colxx xxs="12" sm="6" lg="8">
          {originInvoice && (
            <span>
              <strong>{textOriginInvoice}:</strong> {originInvoice.invoiceNumber}
              {originInvoice.numcai ? ` (CAI: ${originInvoice.numcai})` : ''}
            </span>
          )}
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.custCreditNotes.title.productsDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{textCode}</th>
                  <th>{textDescription}</th>
                  <th>{textQtyInvoiced}</th>
                  <th>{textQtyReturn}</th>
                  <th>{textSubtotal}</th>
                  <th>{textDiscount}</th>
                  <th>{textTax}</th>
                  <th>{textTotalProd}</th>
                  {!disabled && <th>{textOptions}</th>}
                </tr>
              </thead>
              <tbody>
                {detail2.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productCode}</td>
                    <td>{item.description}</td>
                    <td align="right">{formatNumber(item.quantityInvoiced)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.quantity) : (
                        <Input bsSize="sm" type="text" value={item.quantity} onChange={(e) => onChangeDetail2Qty(item.id, e.target.value)} />
                      )}
                    </td>
                    <td align="right">{formatNumber(item.subtotal)}</td>
                    <td align="right">{formatNumber(item.discountValue)}</td>
                    <td align="right">{formatNumber(item.taxValue)}</td>
                    <td align="right">{formatNumber(item.total)}</td>
                    {!disabled && (
                      <td align="right">
                        <Button type="button" className="btn-circle-table" color="outline-danger" onClick={() => fnDeleteDetail2Row(item.id)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={7} align="right">{textTotal}</th>
                  <th align="right">{formatNumber(total, "L.")}</th>
                  {!disabled && <th />}
                </tr>
              </tfoot>
            </Table>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </Form>
  )
}
export default CreditNoteProductsTable;
