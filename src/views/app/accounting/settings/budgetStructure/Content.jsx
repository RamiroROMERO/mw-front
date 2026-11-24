import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useBudget } from './useBudget';
import { ModalLine } from './ModalLine';
import { ModalAccounts } from './ModalAccounts';

// Estructura de Presupuesto (SPEC v2-120-sr): la hoja completa con subir y bajar, el formulario de una línea con sus cuentas, y Excel.
const BudgetStructure = ({ setLoading }) => {
  const { t, privileges, table, fnNew, fnExport, modalLine, modalAccounts, propsToMsgDelete, propsToMsgRemoveAccount } = useBudget({ setLoading });

  const lineModal = {
    ModalContent: ModalLine,
    title: modalLine.form.id ? 'page.budgetStructure.modal.titleEdit' : 'page.budgetStructure.modal.titleNew',
    open: modalLine.open, setOpen: modalLine.setOpen, maxWidth: 'lg', data: modalLine
  };
  const accountsModal = {
    ModalContent: ModalAccounts,
    title: 'page.budgetStructure.modal.titleAccounts',
    open: modalAccounts.open, setOpen: modalAccounts.setOpen, maxWidth: 'lg', data: modalAccounts
  };

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="text-muted small">{t('page.budgetStructure.notice')}</span>
              <span className="d-flex gap-2">
                <Button color="info" size="sm" onClick={fnExport}><i className="bi bi-file-earmark-excel" /> {t('button.export')}</Button>
                <Button color="primary" size="sm" disabled={!privileges.create} onClick={fnNew}><i className="bi bi-plus-lg" /> {t('page.budgetStructure.button.new')}</Button>
              </span>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...lineModal} />
      <Modal {...accountsModal} />
      <Confirmation {...propsToMsgDelete} />
      <Confirmation {...propsToMsgRemoveAccount} />
    </>
  );
};
export default BudgetStructure;
