import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber, validFloat } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

// Equivalente a fac_pos_edit_cost_dist.sc2: herramienta para corregir el costo unitario
// y el factor de distribución que quedaron grabados en el detalle de una factura ya
// guardada, comparándolos contra los valores actuales del catálogo. Solo actualiza las
// filas donde el usuario llena AMBOS valores nuevos — igual criterio que el legacy.
const ModalEditCostDist = (props) => {
  const { data, setOpen } = props;
  const { id, setLoading } = data;

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    request.GET(`billing/process/invoices/editCostDistribution/${id}`, (resp) => {
      setRows(resp.data.map((item) => ({ ...item, newCost: '', newQtyDist: '' })));
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRowChange = (rowId, field, value) => {
    setRows((current) => current.map((row) => row.id === rowId ? { ...row, [field]: value } : row));
  }

  const fnApply = () => {
    const changedRows = rows.filter((row) => validFloat(row.newCost) !== 0 && validFloat(row.newQtyDist) !== 0);
    if (changedRows.length === 0) {
      notification('warning', 'page.invoicing.modal.editCostDist.msg.noChanges', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.PUT(`billing/process/invoices/editCostDistribution/${id}`, changedRows, () => {
      notification('success', 'page.invoicing.modal.editCostDist.msg.success', 'alert.success.title');
      setLoading(false);
      setOpen(false);
    }, (err) => {
      notification('error', 'page.invoicing.modal.editCostDist.msg.error', 'alert.error.title');
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" style={{ overflowX: 'auto' }}>
            <Table bordered hover size='sm'>
              <thead>
                <tr>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.code")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.product")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.appliedCost")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.appliedQtyDist")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.currentCost")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.currentQtyDist")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.newCost")}</th>
                  <th>{IntlMessages("page.invoicing.modal.editCostDist.table.newQtyDist")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.productCode}</td>
                    <td>{row.productName}</td>
                    <td align='right'>{formatNumber(row.appliedCost)}</td>
                    <td align='right'>{formatNumber(row.appliedQtyDist)}</td>
                    <td align='right'>{formatNumber(row.currentCost)}</td>
                    <td align='right'>{formatNumber(row.currentQtyDist)}</td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        value={row.newCost}
                        onChange={(e) => handleRowChange(row.id, 'newCost', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        value={row.newQtyDist}
                        onChange={(e) => handleRowChange(row.id, 'newQtyDist', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnApply}><i className="bi bi-check-lg" /> {IntlMessages("button.accept")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalEditCostDist;
