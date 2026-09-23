import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';

// Botones "CxC"/"CxP" de cont_pdas.sc2 — grilla "Cuentas por Cobrar/Pagar Asignadas a
// este Documento" (cont_pdacxc.sc2 / cont_pdacxp.sc2). Lista los pagos que ESTA partida
// ya aplicó contra facturas existentes; "Agregar" abre el picker (ModalAccountPaymentsAdd).
const ModalAccountPayments = ({ data, setOpen }) => {
  const { payments, entityLabel, fnOpenAdd, fnRemovePayment } = data;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" className="mb-2">
            <Button color="secondary" onClick={fnOpenAdd}>
              <i className="bi bi-plus-lg" /> {IntlMessages('page.dailyItems.button.addLine')}
            </Button>
          </Colxx>
          <Colxx xxs="12" style={{ maxHeight: 350, overflowY: 'auto' }}>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages('page.dailyItems.input.document')}</th>
                  <th>{entityLabel}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.originalValue')}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.appliedValue')}</th>
                  <th>{IntlMessages('page.dailyItems.input.date')}</th>
                  <th>{IntlMessages('page.invoicing.options')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
                  <tr key={row.paymentId}>
                    <td>{row.documentCode}</td>
                    <td>{row.customerName || row.providerName}</td>
                    <td align="right">{formatNumber(row.originalValue)}</td>
                    <td align="right">{formatNumber(row.appliedValue)}</td>
                    <td>{formatDate(row.date)}</td>
                    <td align="right">
                      <Button type="button" className="btn-circle-table" color="danger" title={IntlMessages('button.delete')} onClick={() => fnRemovePayment(row.paymentId)}>
                        <i className="bi bi-trash" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalAccountPayments;
