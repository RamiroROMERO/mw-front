import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { localToday } from '../../process/fuelPurchases/fuelPurchaseRules';
import { useMemoScreen } from './useMemoScreen';
import ModalMemos from './ModalMemos';
import { MAX_NAME, MAX_SUBJECT, isPageSelected, isRowSelected, selectedRows, selectedTotal } from './memoRules';

const MODAL_TITLES = { add: 'page.memos.modal.add.title', print: 'page.purchaseMemo.modal.viewMemos.title', delete: 'page.memos.modal.delete.title' };
const CONFIRM_TITLES = { create: 'page.memos.confirm.create', add: 'page.memos.confirm.add', delete: 'page.memos.confirm.delete' };

// Pantalla común de los memorándums de compras e inventario (SPEC v2-59-sr): cabecera del memorándum, documentos sin reportar (con filtro de fechas,
// búsqueda y páginas en el servidor) y las acciones Marcar Reportadas, Agregar a Reporte, Imprimir Anteriores y Eliminar Reporte.
const MemoScreen = ({ setLoading, kind }) => {
  const intl = useIntl();
  const s = useMemoScreen({ setLoading, kind });
  const { config, form, errors, sendForm, filter, filterErrors, pending, selection } = s;
  // `feedbackText` de los campos recibe la CLAVE de traducción (el componente la traduce): pasar el texto ya traducido da un error de traducción faltante.
  const show = (field) => (sendForm ? errors[field] : undefined);
  const filterError = (field) => filterErrors[field];
  const maxDate = new Date(`${localToday()}T12:00:00`);

  // Las columnas se rehacen con cada cambio de la selección (las celdas con casilla dependen de ella).
  const columns = useMemo(() => [
    {
      text: '',
      header: () => <input type="checkbox" checked={isPageSelected(selection, pending.rows)} onChange={(e) => s.fnTogglePage(e.target.checked)} />,
      dataField: 'selected',
      headerStyle: { width: '4%' },
      cell: ({ row }) => <input type="checkbox" checked={isRowSelected(selection, row.original)} onChange={() => s.fnToggleRow(row.original)} />
    },
    ...config.columns.map((col) => {
      const column = { text: intl.formatMessage({ id: col.label }), dataField: col.field };
      if (col.isNumber) {
        column.style = { textAlign: 'right' };
        column.cell = ({ row }) => formatNumber(row.original[col.field], '', col.field === 'documentNumber' ? 0 : 2);
      } else if (col.isDate) column.cell = ({ row }) => formatDate(row.original[col.field]);
      else if (col.isKind) column.cell = ({ row }) => intl.formatMessage({ id: `page.memos.kind.${row.original.kind}` });
      return column;
    })
  ], [selection, pending.rows, config, intl.locale]);

  const totalPages = Math.max(1, Math.ceil((Number(pending.pagination.totalRecords) || 0) / (Number(pending.pagination.limit) || 50)));
  const offset = Number(pending.pagination.offset) || 0;
  const options = useMemo(() => ({
    typePagination: 2,
    searchFullWidth: true,
    pageSize: Number(pending.pagination.limit) || 50,
    searchDebounceMs: 400,
    currentPage: s.page,
    totalPages,
    setCurrentPage: s.setPage,
    setSearch: s.onSearchText,
    paginationSummary: `${pending.rows.length === 0 ? 0 : offset + 1}-${offset + pending.rows.length} / ${pending.pagination.totalRecords}`
  }), [s.page, totalPages, pending, offset]);

  const count = selectedRows(selection).length;
  const confirmMemo = s.confirm.memo;
  const confirmLegend = s.confirm.type === 'create'
    ? intl.formatMessage({ id: 'page.memos.confirm.legend' }, { count, total: formatNumber(selectedTotal(selection), '', 2) })
    : confirmMemo ? `No. ${confirmMemo.number} - ${formatDate(confirmMemo.date)}` : '';

  const propsToModal = {
    ModalContent: ModalMemos,
    title: MODAL_TITLES[s.modalMode] || MODAL_TITLES.print,
    open: Boolean(s.modalMode),
    setOpen: (open) => { if (!open) s.setModalMode(null); },
    maxWidth: 'xl',
    data: { url: config.basePath, mode: s.modalMode, onChoose: s.fnChooseMemo, onPrint: s.downloadMemo, onDelete: s.fnAskDelete }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <Row>
                <Colxx className="order-xs-2 order-xl-1" xxs="12" sm="6" xl="5">
                  <ContainerWithLabel label="label.title.for">
                    <Row>
                      <Colxx xxs="12"><InputField name="for1" label="input.name" value={form.for1} onChange={s.onFormChange} maxLength={MAX_NAME} invalid={Boolean(show('for1'))} feedbackText={show('for1')} /></Colxx>
                      <Colxx xxs="12"><InputField name="department1" label="page.memos.input.department" value={form.department1} onChange={s.onFormChange} maxLength={MAX_NAME} invalid={Boolean(show('department1'))} feedbackText={show('department1')} /></Colxx>
                    </Row>
                  </ContainerWithLabel>
                </Colxx>
                <Colxx className="order-xs-3 order-xl-2" xxs="12" sm="6" xl="5">
                  <ContainerWithLabel label="label.title.from">
                    <Row>
                      <Colxx xxs="12"><InputField name="from1" label="input.name" value={form.from1} onChange={s.onFormChange} maxLength={MAX_NAME} invalid={Boolean(show('from1'))} feedbackText={show('from1')} /></Colxx>
                      <Colxx xxs="12"><InputField name="department2" label="page.memos.input.department" value={form.department2} onChange={s.onFormChange} maxLength={MAX_NAME} invalid={Boolean(show('department2'))} feedbackText={show('department2')} /></Colxx>
                    </Row>
                  </ContainerWithLabel>
                </Colxx>
                <Colxx className="order-xs-1 order-xl-3" xxs="12" xl="2">
                  <DateCalendar name="date" label="select.date" value={form.date} onChange={s.onFormChange} maxDate={maxDate} feedbackText={show('date')} />
                </Colxx>
                <Colxx className="order-xs-4 order-xl-4" xxs="12">
                  <InputField name="subject" label="input.subject" value={form.subject} onChange={s.onFormChange} maxLength={MAX_SUBJECT} invalid={Boolean(show('subject'))} feedbackText={show('subject')} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="primary" onClick={s.fnMarkReported}><i className="bi bi-check-lg" /> {IntlMessages('button.markReported')}</Button>
                  <Button color="secondary" onClick={s.fnAddToReport}><i className="bi bi-plus" /> {IntlMessages('button.addToReport')}</Button>
                  <Button color="info" onClick={s.fnPrintPrevious}><i className="bi bi-printer" /> {IntlMessages('button.printPrevious')}</Button>
                  {s.canDelete && <Button color="danger" onClick={s.fnDeleteReport}><i className="bi bi-trash" /> {IntlMessages('button.deleteReport')}</Button>}
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12" xs="6" lg="3"><DateCalendar name="dateStart" label="select.dateStart" value={filter.dateStart} onChange={s.onFilterChange} feedbackText={filterError('dateStart')} /></Colxx>
                <Colxx xxs="12" xs="6" lg="3"><DateCalendar name="dateEnd" label="select.dateEnd" value={filter.dateEnd} onChange={s.onFilterChange} feedbackText={filterError('dateEnd')} /></Colxx>
                <Colxx xxs="12" lg="6" className="div-action-button-container">
                  <Button color="primary" onClick={s.fnSearch}><i className="bi bi-search" /> {IntlMessages('button.search')}</Button>
                </Colxx>
              </Row>
              <ReactTable title={intl.formatMessage({ id: config.titleKey })} columns={columns} data={pending.rows} options={options} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <Row>
                <Colxx className="order-xs-2 order-lg-1" xxs="12" lg="7">
                  <InputField name="notes" label="input.observations" value={form.notes} onChange={s.onFormChange} type="textarea" />
                </Colxx>
                <Colxx className="order-xs-3 order-lg-2" xxs="12" lg="3">
                  <Row>
                    <Colxx xxs="12" sm="6" lg="12"><InputField name="createdBy" label="page.purchaseMemo.input.createdBy" value={form.createdBy} onChange={s.onFormChange} maxLength={MAX_NAME} /></Colxx>
                    <Colxx xxs="12" sm="6" lg="12"><InputField name="reviewedBy" label="page.purchaseMemo.input.reviewedBy" value={form.reviewedBy} onChange={s.onFormChange} maxLength={MAX_NAME} /></Colxx>
                  </Row>
                </Colxx>
                <Colxx className="order-xs-1 order-lg-3" xxs="12" xs="6" lg="2">
                  <InputField name="selectedCount" label="page.memos.input.selected" value={count} disabled />
                  <InputField name="total" label="input.total" value={formatNumber(selectedTotal(selection), '', 2)} disabled />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModal} />
      <Confirmation open={s.confirm.open} setOpen={s.setConfirmOpen} fnOnOk={s.fnConfirmOk} title={CONFIRM_TITLES[s.confirm.type] || CONFIRM_TITLES.create} textLegend={confirmLegend} />
    </>
  );
};

export default MemoScreen;
