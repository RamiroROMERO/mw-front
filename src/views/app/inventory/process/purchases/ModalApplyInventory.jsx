import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';

// Legacy inv_compras_up_prices2.sc2 ("Actualizar Precios de Venta", variante multi-unidad):
// muestra el costo ya prorrateado por línea (editable) y los precios 1/2/3 por unidad de
// venta (inv_prod_dist); un precio nuevo en 0 significa "conservar el precio anterior".
const ModalApplyInventory = (props) => {
  const { data, setOpen } = props;
  const { applyInventoryRows, fnUpdateApplyInventoryRow, fnConfirmApplyInventory } = data;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Table bordered hover size="sm" responsive>
              <thead>
                <tr>
                  <th>{IntlMessages("page.purchaseOrders.input.productCode")}</th>
                  <th>{IntlMessages("page.purchaseOrders.input.nameProduct")}</th>
                  <th align="right">{IntlMessages("page.purchaseOrders.input.qty")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.newCost")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.oldPrice1")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.newPrice1")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.oldPrice2")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.newPrice2")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.oldPrice3")}</th>
                  <th align="right">{IntlMessages("page.purchases.modal.applyInventory.newPrice3")}</th>
                </tr>
              </thead>
              <tbody>
                {applyInventoryRows.map((row) => (
                  <tr key={row.distId}>
                    <th scope="row">{row.productCode}</th>
                    <th scope="row">{row.productName}</th>
                    <td align="right">{formatNumber(row.qty)}</td>
                    <td align="right">
                      <input className="form-control form-control-sm" type="number" step="0.0001"
                        value={row.cost} onChange={(e) => fnUpdateApplyInventoryRow(row.distId, 'cost', e.target.value)} />
                    </td>
                    <td align="right">{formatNumber(row.oldPrice1)}</td>
                    <td align="right">
                      <input className="form-control form-control-sm" type="number" step="0.01"
                        value={row.newPrice1} onChange={(e) => fnUpdateApplyInventoryRow(row.distId, 'newPrice1', e.target.value)} />
                    </td>
                    <td align="right">{formatNumber(row.oldPrice2)}</td>
                    <td align="right">
                      <input className="form-control form-control-sm" type="number" step="0.01"
                        value={row.newPrice2} onChange={(e) => fnUpdateApplyInventoryRow(row.distId, 'newPrice2', e.target.value)} />
                    </td>
                    <td align="right">{formatNumber(row.oldPrice3)}</td>
                    <td align="right">
                      <input className="form-control form-control-sm" type="number" step="0.01"
                        value={row.newPrice3} onChange={(e) => fnUpdateApplyInventoryRow(row.distId, 'newPrice3', e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => { fnConfirmApplyInventory(); }}>
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalApplyInventory;
