import { Row, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber, validFloat } from '@Helpers/Utils';

// Equivalente a fac_pos_credit_status.sc2: Límite de Crédito vs. Crédito Actual
// (suma de CxC pendientes del cliente, sin contar la venta en proceso). Igual criterio
// de umbrales que el legacy: excedido si el saldo restante es <=0, advertencia si el uso
// supera el 80% del límite.
const ModalCreditStatus = (props) => {
  const { data, setOpen } = props;
  const { creditLimit, creditCurrent } = data;

  const limit = validFloat(creditLimit);
  const current = validFloat(creditCurrent);
  const rest = limit - current;
  const usagePercent = limit > 0 ? (current / limit) * 100 : 0;

  let warningLabel = null;
  let warningClass = '';
  if (rest <= 0) {
    warningLabel = 'page.invoicing.modal.creditStatus.exceeded';
    warningClass = 'text-danger';
  } else if (usagePercent > 80) {
    warningLabel = 'page.invoicing.modal.creditStatus.warning';
    warningClass = 'text-warning';
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={formatNumber(limit)}
              name="creditLimit"
              disabled
              type="text"
              label="page.invoicing.modal.creditStatus.input.limit"
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              value={formatNumber(current)}
              name="creditCurrent"
              disabled
              type="text"
              label="page.invoicing.modal.creditStatus.input.current"
            />
          </Colxx>
          {warningLabel && (
            <Colxx xxs="12" className="mt-2">
              <strong className={warningClass}>{IntlMessages(warningLabel)}</strong>
            </Colxx>
          )}
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalCreditStatus;
