import { useState } from 'react';
import { Button, Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Modal from '@Components/modal';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import ViewPdf from '@Components/ViewPDF/ViewPdf';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useDailyItems } from './useDailyItems';
import ModalEditLine from './ModalEditLine';
import ModalSearchEntry from './ModalSearchEntry';
import ModalAccountPayments from './ModalAccountPayments';
import ModalAccountPaymentsAdd from './ModalAccountPaymentsAdd';
import ModalAdvance from './ModalAdvance';
import ModalAdvanceSelect from './ModalAdvanceSelect';
import ModalRecurringSelect from './ModalRecurringSelect';
import ModalConceptsSelect from './ModalConceptsSelect';
import ModalAdminExpensesSelect from './ModalAdminExpensesSelect';

const emptyLine = { accountNumber: '', description: '', reference: '', valueDebit: 0, valueCredit: 0 };

const DailyItems = ({ setLoading }) => {
  const {
    formState, onInputChange, onDocumentCodeChange,
    lines, totals,
    listAccounts, listDocuments, listCustomers, listProviders,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine,
    fnAskDeleteDoc, fnPrint, fnExportExcel, fnApplyAuxiliaries,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    openViewFile, setOpenViewFile, documentPath,
    propsToMsgDeleteLine, propsToMsgDeleteDoc,
    fnOpenCxc, openCxcModal, setOpenCxcModal, cxcPayments,
    fnOpenCxcAdd, openCxcAddModal, setOpenCxcAddModal, pendingCxc, fnApplyCxcPayments, fnRemoveCxcPayment,
    fnOpenCxp, openCxpModal, setOpenCxpModal, cxpPayments,
    fnOpenCxpAdd, openCxpAddModal, setOpenCxpAddModal, pendingCxp, fnApplyCxpPayments, fnRemoveCxpPayment,
    fnOpenAdvance, openAdvanceModal, setOpenAdvanceModal, existingAdvance, fnSaveAdvance, fnRemoveAdvance,
    fnOpenAdvanceSelect, openAdvanceSelectModal, setOpenAdvanceSelectModal, pendingAdvances, fnSelectAdvance,
    fnClearAdvanceSelection,
    fnOpenRecurringSelect, openRecurringModal, setOpenRecurringModal, pendingRecurring, fnSelectRecurring,
    fnOpenConcepts, openConceptsModal, setOpenConceptsModal, pendingConcepts,
    fnOpenAdminExpenses, openAdminExpensesModal, setOpenAdminExpensesModal, pendingAdminExpenses, fnSelectAdminExpense
  } = useDailyItems({ setLoading });

  const { numberPDA, documentCode, documentId, date, description, advanceId, advanceValue, advanceProviderName } = formState;
  const [newLine, setNewLine] = useState(emptyLine);
  const [openMsgDeleteAdvance, setOpenMsgDeleteAdvance] = useState(false);

  // IntlMessages() calls useIntl() internally (a hook) — must run unconditionally on every
  // render, not just when the "Anticipo Aplicado" chip below is shown (see
  // feedback_intlmessages_hook_order_gotcha in project memory).
  const currentAdvanceLabel = IntlMessages('page.dailyItems.input.currentAdvance');
  const clearAdvanceLabel = IntlMessages('page.dailyItems.button.clearAdvance');

  const onNewLineChange = ({ target }) => {
    if (target.name === 'accountNumber') {
      const account = listAccounts.find((a) => a.value === target.value);
      setNewLine((prev) => ({ ...prev, accountNumber: target.value, description: account?.name || '' }));
      return;
    }
    setNewLine((prev) => ({ ...prev, [target.name]: target.value }));
  }

  const fnAcceptAddLine = () => {
    if (fnAddLine(newLine)) setNewLine(emptyLine);
  }

  // "Conceptos" picks pre-fill the NEW-LINE row's account (newLine lives in this component,
  // not the hook) — same account-derived-description convention as onNewLineChange above.
  const fnSelectConcept = (row) => {
    const account = listAccounts.find((a) => a.value === row.accountNumber);
    setNewLine((prev) => ({ ...prev, accountNumber: row.accountNumber, description: account?.name || row.accountName }));
    setOpenConceptsModal(false);
  }

  const propsToModalSearch = {
    ModalContent: ModalSearchEntry,
    title: 'page.dailyItems.modal.search.title',
    open: openSearchModal,
    setOpen: setOpenSearchModal,
    maxWidth: 'lg',
    data: { searchResults, fnSelectEntry }
  };

  const propsToModalEditLine = {
    ModalContent: ModalEditLine,
    title: 'page.dailyItems.modal.editLine.title',
    open: openEditLineModal,
    setOpen: setOpenEditLineModal,
    maxWidth: 'md',
    data: { line: editingLine || emptyLine, listAccounts, listCustomers, listProviders, fnUpdateLine }
  };

  const propsToControlPanel = {
    fnNew,
    fnSearch: fnOpenSearch,
    fnSave,
    fnPrint,
    fnDelete: fnAskDeleteDoc,
    buttonsHome: [
      {
        title: 'button.export',
        icon: 'bi bi-file-earmark-excel',
        onClick: fnExportExcel
      },
      {
        title: 'page.dailyItems.button.applyAuxiliaries',
        icon: 'bi bi-link-45deg',
        onClick: fnApplyAuxiliaries
      },
      {
        title: 'page.dailyItems.button.cxc',
        icon: 'bi bi-cash-coin',
        onClick: fnOpenCxc
      },
      {
        title: 'page.dailyItems.button.cxp',
        icon: 'bi bi-cash-stack',
        onClick: fnOpenCxp
      },
      {
        title: 'page.dailyItems.button.advance',
        icon: 'bi bi-cash',
        onClick: fnOpenAdvance
      },
      {
        title: 'page.dailyItems.button.selectAdvance',
        icon: 'bi bi-bookmark-check',
        onClick: fnOpenAdvanceSelect
      },
      {
        title: 'page.dailyItems.button.recurring',
        icon: 'bi bi-arrow-repeat',
        onClick: fnOpenRecurringSelect
      },
      {
        title: 'page.dailyItems.button.concepts',
        icon: 'bi bi-journal-text',
        onClick: fnOpenConcepts
      },
      {
        title: 'page.dailyItems.button.adminExpenses',
        icon: 'bi bi-receipt',
        onClick: fnOpenAdminExpenses
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  };

  const propsToModalCxc = {
    ModalContent: ModalAccountPayments,
    title: 'page.dailyItems.modal.cxc.title',
    open: openCxcModal,
    setOpen: setOpenCxcModal,
    maxWidth: 'lg',
    data: { payments: cxcPayments, entityLabel: IntlMessages('page.dailyItems.input.customer'), fnOpenAdd: fnOpenCxcAdd, fnRemovePayment: fnRemoveCxcPayment }
  };

  const propsToModalCxcAdd = {
    ModalContent: ModalAccountPaymentsAdd,
    title: 'page.dailyItems.modal.cxcAdd.title',
    open: openCxcAddModal,
    setOpen: setOpenCxcAddModal,
    maxWidth: 'lg',
    data: { pending: pendingCxc, entityLabel: IntlMessages('page.dailyItems.input.customer'), fnApplyPayments: fnApplyCxcPayments }
  };

  const propsToModalCxp = {
    ModalContent: ModalAccountPayments,
    title: 'page.dailyItems.modal.cxp.title',
    open: openCxpModal,
    setOpen: setOpenCxpModal,
    maxWidth: 'lg',
    data: { payments: cxpPayments, entityLabel: IntlMessages('page.dailyItems.input.provider'), fnOpenAdd: fnOpenCxpAdd, fnRemovePayment: fnRemoveCxpPayment }
  };

  const propsToModalCxpAdd = {
    ModalContent: ModalAccountPaymentsAdd,
    title: 'page.dailyItems.modal.cxpAdd.title',
    open: openCxpAddModal,
    setOpen: setOpenCxpAddModal,
    maxWidth: 'lg',
    data: { pending: pendingCxp, entityLabel: IntlMessages('page.dailyItems.input.provider'), fnApplyPayments: fnApplyCxpPayments }
  };

  const propsToModalAdvance = {
    ModalContent: ModalAdvance,
    title: 'page.dailyItems.modal.advance.title',
    open: openAdvanceModal,
    setOpen: setOpenAdvanceModal,
    maxWidth: 'md',
    data: {
      existingAdvance,
      listProviders,
      fnSaveAdvance,
      // Close this modal before opening the confirmation: Confirmation isn't a
      // portal-rendered Modal, so its "position: fixed" stacking loses to an already-open
      // reactstrap Modal's own stacking context — its buttons render but don't receive
      // clicks (confirmed via elementFromPoint, a real bug caught by browser E2E testing).
      fnAskRemoveAdvance: () => { setOpenAdvanceModal(false); setOpenMsgDeleteAdvance(true); }
    }
  };

  const propsToModalAdvanceSelect = {
    ModalContent: ModalAdvanceSelect,
    title: 'page.dailyItems.modal.advanceSelect.title',
    open: openAdvanceSelectModal,
    setOpen: setOpenAdvanceSelectModal,
    maxWidth: 'lg',
    data: { pending: pendingAdvances, fnSelectAdvance }
  };

  const propsToModalRecurringSelect = {
    ModalContent: ModalRecurringSelect,
    title: 'page.dailyItems.modal.recurringSelect.title',
    open: openRecurringModal,
    setOpen: setOpenRecurringModal,
    maxWidth: 'lg',
    data: { pending: pendingRecurring, fnSelectRecurring }
  };

  const propsToModalConceptsSelect = {
    ModalContent: ModalConceptsSelect,
    title: 'page.dailyItems.modal.concepts.title',
    open: openConceptsModal,
    setOpen: setOpenConceptsModal,
    maxWidth: 'lg',
    data: { pending: pendingConcepts, fnSelectConcept }
  };

  const propsToModalAdminExpensesSelect = {
    ModalContent: ModalAdminExpensesSelect,
    title: 'page.dailyItems.modal.adminExpensesSelect.title',
    open: openAdminExpensesModal,
    setOpen: setOpenAdminExpensesModal,
    maxWidth: 'lg',
    data: { pending: pendingAdminExpenses, fnSelectAdminExpense }
  };

  const propsToMsgDeleteAdvance = {
    open: openMsgDeleteAdvance,
    setOpen: setOpenMsgDeleteAdvance,
    // fnRemoveAdvance lives in useDailyItems.js and has no access to this dialog's own
    // setOpen — close it here, matching the self-closing convention every other
    // Confirmation's fnOnOk follows (e.g. fnDeleteLineOk/fnDeleteDocOk).
    fnOnOk: () => { fnRemoveAdvance(); setOpenMsgDeleteAdvance(false); },
    title: 'page.dailyItems.msg.advanceRemoveConfirm'
  };

  const propsToViewPdf = {
    ModalContent: ViewPdf,
    title: 'page.dailyItems.modal.viewDocument.title',
    valueTitle: numberPDA,
    fullscreen: true,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: { documentPath }
  };

  return (
    <Card className="mb-3">
      <CardBody>
        <ControlPanel {...propsToControlPanel} />
        <Separator className="mt-2 mb-3" />
        <Row>
          <Colxx xxs="12" sm="8">
            <SearchSelect
              label="page.dailyItems.input.documentCode"
              name="documentCode"
              inputValue={documentCode}
              onChange={onDocumentCodeChange}
              options={listDocuments}
            />
            <InputField name="description" label="page.dailyItems.input.description" value={description} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="numberPDA" label="page.dailyItems.input.numberPDA" value={numberPDA || ''} type="text" disabled />
            <InputField name="documentId" label="page.dailyItems.input.documentId" value={documentId || ''} onChange={onInputChange} type="text" />
            <DateCalendar name="date" label="page.dailyItems.input.date" value={date} onChange={onInputChange} />
          </Colxx>
        </Row>

        {/* Moneda oculta por ahora: todo se contabiliza en Lempiras (DEFAULT_CURRENCY_CODE
            en useDailyItems.js) aunque algunos documentos se registren en dólares. */}

        {Number(advanceId) > 0 && (
          <Row>
            <Colxx xxs="12" className="d-flex align-items-center mb-2">
              <span className="fw-bold me-2">{currentAdvanceLabel}:</span>
              <span className="me-3">{advanceProviderName} — {formatNumber(advanceValue)}</span>
              <Button type="button" size="sm" color="danger" onClick={fnClearAdvanceSelection}>
                <i className="bi bi-x-lg" /> {clearAdvanceLabel}
              </Button>
            </Colxx>
          </Row>
        )}

        <hr />

        <Row className="align-items-end">
          <Colxx xxs="12" sm="4">
            <SearchSelect
              label="page.dailyItems.input.account"
              name="accountNumber"
              inputValue={newLine.accountNumber}
              onChange={onNewLineChange}
              options={listAccounts}
            />
          </Colxx>
          <Colxx xxs="12" sm="2">
            <InputField name="reference" label="page.dailyItems.input.reference" value={newLine.reference} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="2">
            <InputField name="valueDebit" label="page.dailyItems.input.debit" value={newLine.valueDebit} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="2">
            <InputField name="valueCredit" label="page.dailyItems.input.credit" value={newLine.valueCredit} onChange={onNewLineChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="2" className="div-action-button-container align-items-end">
            <Button color="secondary" onClick={fnAcceptAddLine}>
              <i className="bi bi-plus-lg" /> {IntlMessages('page.dailyItems.button.addLine')}
            </Button>
          </Colxx>
        </Row>

        <Table bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>{IntlMessages('page.dailyItems.input.account')}</th>
              <th>{IntlMessages('page.dailyItems.input.description')}</th>
              <th align="right">{IntlMessages('page.dailyItems.input.debit')}</th>
              <th align="right">{IntlMessages('page.dailyItems.input.credit')}</th>
              <th>{IntlMessages('page.invoicing.options')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.id || line.tempId || idx}>
                <td>{line.accountName}</td>
                <td>{line.description}</td>
                <td align="right">{formatNumber(line.valueDebit)}</td>
                <td align="right">{formatNumber(line.valueCredit)}</td>
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
              <th colSpan="2" align="right">{IntlMessages('page.dailyItems.input.totals')}</th>
              <th align="right">{formatNumber(totals.totalDebit)}</th>
              <th align="right">{formatNumber(totals.totalCredit)}</th>
              <th align="right">{totals.diff !== 0 ? formatNumber(totals.diff) : ''}</th>
            </tr>
          </tfoot>
        </Table>
      </CardBody>

      <Modal {...propsToModalSearch} />
      <Modal {...propsToModalEditLine} />
      <Modal {...propsToViewPdf} />
      <Modal {...propsToModalCxc} />
      <Modal {...propsToModalCxcAdd} />
      <Modal {...propsToModalCxp} />
      <Modal {...propsToModalCxpAdd} />
      <Modal {...propsToModalAdvance} />
      <Modal {...propsToModalAdvanceSelect} />
      <Modal {...propsToModalRecurringSelect} />
      <Modal {...propsToModalConceptsSelect} />
      <Modal {...propsToModalAdminExpensesSelect} />
      <Confirmation {...propsToMsgDeleteLine} />
      <Confirmation {...propsToMsgDeleteDoc} />
      <Confirmation {...propsToMsgDeleteAdvance} />
    </Card>
  );
}
export default DailyItems;
