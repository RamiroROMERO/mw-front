import { Row, Form, Button, Table, Input } from 'reactstrap';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';

const CreditNoteProductsTable = (props) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { detail2, originPurchase, fnSeekOriginPurchase, onChangeDetail2Qty, fnDeleteDetail2Row, disabled } = props;

  const total = detail2.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="4">
          {!disabled && (
            <Button color="primary" onClick={fnSeekOriginPurchase}>
              <i className="bi bi-file-earmark-post" /> {t("button.selectInvoice")}
            </Button>
          )}
        </Colxx>
        <Colxx xxs="12" sm="6" lg="8">
          {originPurchase && (
            <span>
              <strong>{t("page.creditNotesProv.input.originPurchase")}:</strong> {originPurchase.invoiceNumber}
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
                  <th>{t("table.column.code")}</th>
                  <th>{t("table.column.description")}</th>
                  <th>{t("table.column.qty")}</th>
                  <th>{t("table.column.qtyReturn")}</th>
                  <th>{t("input.subtotal")}</th>
                  <th>{t("input.discount")}</th>
                  <th>{t("input.tax")}</th>
                  <th>{t("table.column.total")}</th>
                  {!disabled && <th>{t("table.column.options")}</th>}
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
                    <td align="right">{formatNumber(item.total)}</td>
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
                  <th colSpan={7} align="right">{t("input.total")}</th>
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
