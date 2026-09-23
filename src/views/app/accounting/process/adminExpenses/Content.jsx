import { useState } from 'react';
import { Button, Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Modal from '@Components/modal';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useAdminExpenses } from './useAdminExpenses';
import ModalEditLine from './ModalEditLine';
import ModalSearchEntry from './ModalSearchEntry';

const emptyLine = { documentCode: '', date: new Date().toISOString().substring(0, 10), name: '', provider: '', idCtaCont: '', valExent: 0, valGrav: 0, valTax: 0 };

// "Gastos Administrativos" (cont_gastadmin.sc2): documento de "Solicitud de Cheque", no es
// partida doble. Sus líneas se importan en Partidas Diarias (ver accounting/process/dailyItems
// "Gastos Admin." button) como líneas de Débito.
const AdminExpenses = ({ setLoading }) => {
  const {
    formState, onInputChange,
    lines, totals, listAccounts,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine,
    fnAskDeleteDoc,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    propsToMsgDeleteLine, propsToMsgDeleteDoc
  } = useAdminExpenses({ setLoading });

  const { date, description, responsible, isLiquidated } = formState;
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
    title: 'page.adminExpenses.modal.search.title',
    open: openSearchModal,
    setOpen: setOpenSearchModal,
    maxWidth: 'lg',
    data: { searchResults, fnSelectEntry }
  };

  const propsToModalEditLine = {
    ModalContent: ModalEditLine,
    title: 'page.adminExpenses.modal.editLine.title',
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

        {isLiquidated && (
          <Row>
            <Colxx xxs="12" className="mb-2">
              <span className="badge bg-danger">{IntlMessages('page.adminExpenses.msg.liquidated')}</span>
            </Colxx>
          </Row>
        )}

        <Row>
          <Colxx xxs="12" sm="4">
            <DateCalendar name="date" label="page.adminExpenses.input.date" value={date} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="description" label="page.adminExpenses.input.description" value={description} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="responsible" label="page.adminExpenses.input.responsible" value={responsible} onChange={onInputChange} type="text" />
          </Colxx>
        </Row>

        <hr />

        <Row className="align-items-end">
          <Colxx xxs="6" sm="2">
            <InputField name="documentCode" label="page.adminExpenses.input.documentCode" value={newLine.documentCode} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="2">
            <DateCalendar name="date" label="page.adminExpenses.input.lineDate" value={newLine.date} onChange={onNewLineChange} />
          </Colxx>
          <Colxx xxs="12" sm="3">
            <InputField name="name" label="page.adminExpenses.input.description" value={newLine.name} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="2">
            <InputField name="provider" label="page.adminExpenses.input.provider" value={newLine.provider} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="3">
            <SearchSelect
              label="page.adminExpenses.input.account"
              name="idCtaCont"
              inputValue={newLine.idCtaCont}
              onChange={onNewLineChange}
              options={listAccounts}
            />
          </Colxx>
        </Row>
        <Row className="align-items-end mt-2">
          <Colxx xxs="4" sm="2">
            <InputField name="valExent" label="page.adminExpenses.input.exempt" value={newLine.valExent} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="4" sm="2">
            <InputField name="valGrav" label="page.adminExpenses.input.taxed" value={newLine.valGrav} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="4" sm="2">
            <InputField name="valTax" label="page.adminExpenses.input.tax" value={newLine.valTax} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="2" className="div-action-button-container align-items-end">
            <Button color="secondary" onClick={fnAcceptAddLine}>
              <i className="bi bi-plus-lg" /> {IntlMessages('page.adminExpenses.button.addLine')}
            </Button>
          </Colxx>
        </Row>

        <Table bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>{IntlMessages('page.adminExpenses.input.documentCode')}</th>
              <th>{IntlMessages('page.adminExpenses.input.description')}</th>
              <th>{IntlMessages('page.adminExpenses.input.provider')}</th>
              <th>{IntlMessages('page.adminExpenses.input.account')}</th>
              <th align="right">{IntlMessages('page.adminExpenses.input.total')}</th>
              <th>{IntlMessages('page.invoicing.options')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.id || line.tempId || idx}>
                <td>{line.documentCode}</td>
                <td>{line.name}</td>
                <td>{line.provider}</td>
                <td>{line.idCtaCont} - {line.nomcta}</td>
                <td align="right">{formatNumber(line.value)}</td>
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
              <th colSpan="4" align="right">{IntlMessages('page.adminExpenses.input.total')}</th>
              <th align="right">{formatNumber(totals.total)}</th>
              <th />
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
export default AdminExpenses;
