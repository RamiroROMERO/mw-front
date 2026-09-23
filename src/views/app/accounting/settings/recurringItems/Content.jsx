import { useState } from 'react';
import { Button, Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Modal from '@Components/modal';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useRecurringItems } from './useRecurringItems';
import ModalEditLine from './ModalEditLine';
import ModalSearchEntry from './ModalSearchEntry';

const emptyLine = { idCtaAccount: '', referenceCode: '', valDebe: 0, valHaber: 0 };

// "Partidas Recurrentes" (cont_pdas_pre.sc2): plantillas de asientos contables cargadas
// manualmente en una Partida de Diario NUEVA desde "Asientos Pre." (ver
// accounting/process/dailyItems). No es un job automático.
const RecurringItems = ({ setLoading }) => {
  const {
    formState, onInputChange,
    lines, totals, listAccounts,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine, fnUpdateAllLinesDescription,
    fnAskDeleteDoc,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    propsToMsgDeleteLine, propsToMsgDeleteDoc
  } = useRecurringItems({ setLoading });

  const { name, descrip, dayRun, status } = formState;
  const [newLine, setNewLine] = useState(emptyLine);

  const onNewLineChange = ({ target }) => {
    setNewLine((prev) => ({ ...prev, [target.name]: target.value }));
  }

  const fnAcceptAddLine = () => {
    if (fnAddLine(newLine)) setNewLine(emptyLine);
  }

  const propsToControlPanel = {
    fnNew,
    fnSearch: fnOpenSearch,
    fnSave,
    fnDelete: fnAskDeleteDoc,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  };

  const propsToModalSearch = {
    ModalContent: ModalSearchEntry,
    title: 'page.recurringItems.modal.search.title',
    open: openSearchModal,
    setOpen: setOpenSearchModal,
    maxWidth: 'lg',
    data: { searchResults, fnSelectEntry }
  };

  const propsToModalEditLine = {
    ModalContent: ModalEditLine,
    title: 'page.recurringItems.modal.editLine.title',
    open: openEditLineModal,
    setOpen: setOpenEditLineModal,
    maxWidth: 'md',
    data: { line: editingLine || emptyLine, listAccounts, fnUpdateLine }
  };

  return (
    <Card className="mb-3">
      <CardBody>
        <ControlPanel {...propsToControlPanel} />
        <Separator className="mt-2 mb-3" />
        <Row>
          <Colxx xxs="12" sm="6">
            <InputField name="name" label="page.recurringItems.input.name" value={name} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="3">
            <InputField name="dayRun" label="page.recurringItems.input.dayRun" value={dayRun} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="3">
            <Checkbox name="status" value={status} onChange={onInputChange} label="page.recurringItems.check.active" />
          </Colxx>
        </Row>
        <Row className="align-items-end">
          <Colxx xxs="12" sm="10">
            <InputField name="descrip" label="page.recurringItems.input.description" value={descrip} onChange={onInputChange} type="textarea" rows={2} />
          </Colxx>
          <Colxx xxs="12" sm="2" className="div-action-button-container align-items-end">
            <Button color="secondary" onClick={fnUpdateAllLinesDescription}>
              <i className="bi bi-arrow-repeat" /> {IntlMessages('page.recurringItems.button.updateItems')}
            </Button>
          </Colxx>
        </Row>

        <hr />

        <Row className="align-items-end">
          <Colxx xxs="12" sm="5">
            <SearchSelect
              label="page.recurringItems.input.account"
              name="idCtaAccount"
              inputValue={newLine.idCtaAccount}
              onChange={onNewLineChange}
              options={listAccounts}
            />
          </Colxx>
          <Colxx xxs="12" sm="2">
            <InputField name="referenceCode" label="page.recurringItems.input.reference" value={newLine.referenceCode} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="2">
            <InputField name="valDebe" label="page.recurringItems.input.debit" value={newLine.valDebe} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="1">
            <InputField name="valHaber" label="page.recurringItems.input.credit" value={newLine.valHaber} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="2" className="div-action-button-container align-items-end">
            <Button color="secondary" onClick={fnAcceptAddLine}>
              <i className="bi bi-plus-lg" /> {IntlMessages('page.recurringItems.button.addLine')}
            </Button>
          </Colxx>
        </Row>

        <Table bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>{IntlMessages('page.recurringItems.input.account')}</th>
              <th>{IntlMessages('page.recurringItems.input.reference')}</th>
              <th align="right">{IntlMessages('page.recurringItems.input.debit')}</th>
              <th align="right">{IntlMessages('page.recurringItems.input.credit')}</th>
              <th>{IntlMessages('page.invoicing.options')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.id || line.tempId || idx}>
                <td>{line.accountName || line.idCtaAccount}</td>
                <td>{line.referenceCode}</td>
                <td align="right">{formatNumber(line.valDebe)}</td>
                <td align="right">{formatNumber(line.valHaber)}</td>
                <td align="right">
                  <Button type="button" className="btn-circle-table" color="primary" title="Editar" onClick={() => fnEditLine(line)}>
                    <i className="bi bi-pencil" />
                  </Button>
                  {' '}
                  <Button type="button" className="btn-circle-table" color="danger" title="Eliminar" onClick={() => fnAskDeleteLine(line)}>
                    <i className="bi bi-trash" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th align="right">{IntlMessages('page.recurringItems.input.totals')}</th>
              <th />
              <th align="right">{formatNumber(totals.totalDebit)}</th>
              <th align="right">{formatNumber(totals.totalCredit)}</th>
              <th align="right">{totals.diff !== 0 ? formatNumber(totals.diff) : ''}</th>
            </tr>
          </tfoot>
        </Table>
      </CardBody>

      <Modal {...propsToModalSearch} />
      <Modal {...propsToModalEditLine} />
      <Confirmation {...propsToMsgDeleteLine} />
      <Confirmation {...propsToMsgDeleteDoc} />
    </Card>
  );
}
export default RecurringItems;
