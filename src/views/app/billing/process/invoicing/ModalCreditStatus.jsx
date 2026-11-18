import { Row, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber } from '@Helpers/Utils';

// Estado de crédito del cliente (fac_pos_credit_status.sc2; SPEC v2-73-sr): límite, crédito actual (saldo de la CxC), disponible y porcentaje de uso. Todo viene
// calculado del servidor (`GET creditStatus`); aquí solo se muestra. Excedido = lo usado alcanza el límite; advertencia = pasa del 80 %; sin límite configurado
// (límite 0) no hay alerta. Solo avisa.
const ModalCreditStatus = (props) => {
  const { data, setOpen } = props;
  const status = data.creditStatus || {};

  const warningByLevel = {
    exceeded: { label: 'page.invoicing.modal.creditStatus.exceeded', className: 'text-danger' },
    warning: { label: 'page.invoicing.modal.creditStatus.warning', className: 'text-warning' },
    none: { label: 'page.invoicing.modal.creditStatus.none', className: 'text-muted' }
  };
  const alert = warningByLevel[status.level] || null;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField value={formatNumber(status.limit || 0)} name="creditLimit" disabled type="text" label="page.invoicing.modal.creditStatus.input.limit" />
          </Colxx>
          <Colxx xxs="12">
            <InputField value={formatNumber(status.balance || 0)} name="creditCurrent" disabled type="text" label="page.invoicing.modal.creditStatus.input.current" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField value={formatNumber(status.available || 0)} name="creditAvailable" disabled type="text" label="page.invoicing.modal.creditStatus.input.available" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField value={`${formatNumber(status.percent || 0)} %`} name="creditPercent" disabled type="text" label="page.invoicing.modal.creditStatus.input.percent" />
          </Colxx>
          {alert && (
            <Colxx xxs="12" className="mt-2">
              <strong className={alert.className}>{IntlMessages(alert.label)}</strong>
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
