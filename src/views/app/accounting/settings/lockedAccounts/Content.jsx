import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useLockedAccounts } from './useLockedAccounts';
import { ModalLock } from './ModalLock';
import { STATUS_FILTERS } from './lockedAccountRules';

const Content = ({ setLoading }) => {
  const { t, privileges, status, onStatusChange, table, fnNew, modal, propsToMsgUnlock } = useLockedAccounts({ setLoading });

  const statusOptions = STATUS_FILTERS.map((value) => ({ value, label: t(`page.lockedAccounts.filter.${value}`) }));
  const modalLock = {
    ModalContent: ModalLock,
    title: modal.editing ? 'page.lockedAccounts.modal.titleEdit' : 'page.lockedAccounts.modal.titleNew',
    open: modal.open, setOpen: modal.setOpen, maxWidth: 'lg', data: modal
  };

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12" md="4">
                  <SearchSelect name="status" inputValue={status} onChange={onStatusChange} label="page.lockedAccounts.filter.status" options={statusOptions} isClearable={false} />
                </Colxx>
                <Colxx xxs="12" md="8" className="d-flex align-items-end justify-content-end">
                  <Button color="primary" size="sm" disabled={!privileges.create} onClick={fnNew}>
                    <i className="bi bi-lock" /> {t('page.lockedAccounts.button.lock')}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...modalLock} />
      <Confirmation {...propsToMsgUnlock} />
    </>
  );
};

export default Content;
