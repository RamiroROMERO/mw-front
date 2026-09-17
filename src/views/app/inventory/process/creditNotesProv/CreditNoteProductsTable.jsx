import { Row, Form, Button, Table, Input } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const CreditNoteProductsTable = (props) => {
  const { detail2, originPurchase, fnSeekOriginPurchase, onChangeDetail2Qty, fnDeleteDetail2Row, disabled } = props;

  const total = detail2.reduce((sum, item) => sum + Number(item.totalReturn || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="4">
          {!disabled && (
            <Button color="primary" onClick={fnSeekOriginPurchase}>
              <i className="bi bi-file-earmark-post" /> {IntlMessages("button.selectInvoice")}
            </Button>
          )}
        </Colxx>
        <Colxx xxs="12" sm="6" lg="8">
          {originPurchase && (
            <span>
              <strong>{IntlMessages("page.creditNotesProv.input.originPurchase")}:</strong> {originPurchase.numCai}
            </span>
          )}
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.creditNotesProv.title.productsDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages("table.column.code")}</th>
                  <th>{IntlMessages("table.column.description")}</th>
                  <th>{IntlMessages("table.column.qty")}</th>
                  <th>{IntlMessages("table.column.qtyReturn")}</th>
                  <th>{IntlMessages("input.subtotal")}</th>
                  <th>{IntlMessages("input.discount")}</th>
                  <th>{IntlMessages("input.tax")}</th>
                  <th>{IntlMessages("table.column.total")}</th>
                  {!disabled && <th>{IntlMessages("table.column.options")}</th>}
                </tr>
              </thead>
              <tbody>
                {detail2.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productCode}</td>
                    <td>{item.description}</td>
                    <td align="right">{formatNumber(item.qty)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.qtyReturn) : (
                        <Input bsSize="sm" type="text" value={item.qtyReturn} onChange={(e) => onChangeDetail2Qty(item.id, e.target.value)} />
                      )}
                    </td>
                    <td align="right">{formatNumber(item.subtotal)}</td>
                    <td align="right">{formatNumber(item.discountValue)}</td>
                    <td align="right">{formatNumber(item.taxValue)}</td>
                    <td align="right">{formatNumber(item.totalReturn)}</td>
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
                  <th colSpan={7} align="right">{IntlMessages("input.total")}</th>
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
