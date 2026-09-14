import { Row, Form, Button, Table, Input } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const DebitNoteProductsTable = (props) => {
  const { detail2, originInvoice, fnSeekOriginInvoice, onChangeDetail2Qty, onChangeDetail2Price, fnDeleteDetail2Row, disabled } = props;

  const total = detail2.reduce((sum, item) => sum + Number(item.valueTotal1 || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="4">
          {!disabled && (
            <Button color="primary" onClick={fnSeekOriginInvoice}>
              <i className="bi bi-file-earmark-post" /> {IntlMessages("button.selectInvoice")}
            </Button>
          )}
        </Colxx>
        <Colxx xxs="12" sm="6" lg="8">
          {originInvoice && (
            <span>
              <strong>{IntlMessages("page.custDebitNotes.input.originInvoice")}:</strong> {originInvoice.invoiceNumber}
              {originInvoice.numcai ? ` (CAI: ${originInvoice.numcai})` : ''}
            </span>
          )}
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.custDebitNotes.title.productsDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages("page.invoicing.table.code")}</th>
                  <th>{IntlMessages("page.invoicing.input.descriptionProd")}</th>
                  <th>{IntlMessages("page.custDebitNotes.table.qtyInvoiced")}</th>
                  <th>{IntlMessages("page.custDebitNotes.table.qtyAdditional")}</th>
                  <th>{IntlMessages("page.custDebitNotes.table.priceInvoiced")}</th>
                  <th>{IntlMessages("page.custDebitNotes.table.priceNew")}</th>
                  <th>{IntlMessages("page.invoicing.input.taxValue")}</th>
                  <th>{IntlMessages("page.invoicing.input.totalProd")}</th>
                  {!disabled && <th>{IntlMessages("page.invoicing.options")}</th>}
                </tr>
              </thead>
              <tbody>
                {detail2.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productCode}</td>
                    <td>{item.description}</td>
                    <td align="right">{formatNumber(item.quantityInvoiced)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.quantity) : (
                        <Input bsSize="sm" type="text" value={item.quantity} onChange={(e) => onChangeDetail2Qty(item.id, e.target.value)} />
                      )}
                    </td>
                    <td align="right">{formatNumber(item.priceInvoiced)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.price) : (
                        <Input bsSize="sm" type="text" value={item.price} onChange={(e) => onChangeDetail2Price(item.id, e.target.value)} />
                      )}
                    </td>
                    <td align="right">{formatNumber(item.taxValue)}</td>
                    <td align="right">{formatNumber(item.valueTotal1)}</td>
                    {!disabled && (
                      <td align="right">
                        <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar" onClick={() => fnDeleteDetail2Row(item.id)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={7} align="right">{IntlMessages("page.invoicing.input.total")}</th>
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
export default DebitNoteProductsTable;
