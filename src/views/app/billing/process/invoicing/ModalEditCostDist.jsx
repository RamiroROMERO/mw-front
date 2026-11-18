import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { InputField } from '@Components/inputFields';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { API_PATH, buildCostBody, validateCostRows } from './postEditRules';

// Equivalente a fac_pos_edit_cost_dist.sc2: herramienta para corregir el costo unitario
// y el factor de distribución que quedaron grabados en el detalle de una factura ya
// guardada, comparándolos contra los valores actuales del catálogo. Solo actualiza las
// filas donde el usuario llena AMBOS valores nuevos — igual criterio que el legacy. SPEC v2-72-sr: pide motivo y el servidor regenera el kardex de la venta y la
// partida de costo en la misma transacción.
const ModalEditCostDist = (props) => {
  const { data, setOpen } = props;
  const { id, setLoading } = data;

  const [rows, setRows] = useState([]);
  const [reason, setReason] = useState('');
  const [send, setSend] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    request.GET(`${API_PATH}/${id}/costs`, (resp) => {
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
    setSend(true);
    const problem = validateCostRows(rows, reason);
    if (problem) {
      notification('warning', problem, 'alert.warning.title');
      return;
    }
    setLoading(true);
    // El mensaje real del back (período cerrado, existencia, compuesto...) lo muestra `request.PUT`: aquí solo se libera la pantalla.
    request.PUT(`${API_PATH}/${id}/costs`, buildCostBody(rows, reason), () => {
      notification('success', 'page.invoicing.modal.editCostDist.msg.success', 'alert.success.title');
      setLoading(false);
      setOpen(false);
    }, () => {
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
        <Row className="mt-2">
          <Colxx xxs="12">
            <InputField value={reason} name="reason" onChange={(e) => setReason(e.target.value)} type="text" maxLength={200} label="page.invoicing.modal.postEdit.reason"
              invalid={send && !reason.trim()} feedbackText={send && !reason.trim() ? 'page.invoicing.modal.postEdit.error.reason' : null} />
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
