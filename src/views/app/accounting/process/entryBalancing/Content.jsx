import { Alert, Badge, Button, Card, CardBody, Input, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Modal from '@Components/modal';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useEntryBalancing } from './useEntryBalancing';
import { ModalDetail } from './ModalDetail';
import { ModalPreview } from './ModalPreview';
import { ModalIgnore } from './ModalIgnore';
import {
  CATEGORIES, categoryMeta, statusMeta, subcategoryLabelKey, actionLabelKey, summaryTotals
} from './entryBalancingRules';

const Content = (props) => {
  const { setLoading } = props;
  const eb = useEntryBalancing({ setLoading });
  const {
    t, privileges, filters, onFilterChange, fnSearch, fnPickCategory, fnExport, page, items, pagination, load,
    selected, selectedItems, actions, mixed, allIgnored, fnToggle, fnTogglePage, pageAllSelected, fnClearSelection,
    fnOpenDetail, fnStartAction, fnReopen, busy
  } = eb;

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: t(categoryMeta(c).labelKey) }));
  const statusOptions = ['pending', 'repaired', 'ignored', 'all'].map((s) => ({ value: s, label: t(`page.entryBalancing.status.${s}`) }));
  const summary = pagination.summary || [];
  const totals = summaryTotals(summary);
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 25)));

  const modalDetail = {
    ModalContent: ModalDetail, title: 'page.entryBalancing.detail.title', open: eb.openDetail, setOpen: eb.setOpenDetail,
    maxWidth: 'xl', data: eb
  };
  const modalPreview = {
    ModalContent: ModalPreview, title: 'page.entryBalancing.preview.title', open: eb.openPreview, setOpen: eb.setOpenPreview,
    maxWidth: 'xl', data: eb
  };
  const modalIgnore = {
    ModalContent: ModalIgnore, title: 'page.entryBalancing.ignore.title', open: eb.openIgnore, setOpen: eb.setOpenIgnore,
    maxWidth: 'md', data: eb
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-3">
            <CardBody>
              {!privileges.repair && <Alert color="info">{t('page.entryBalancing.notice.noRepair')}</Alert>}
              {pagination.logAvailable === false && <Alert color="warning">{t('page.entryBalancing.summary.logUnavailable')}</Alert>}

              <Row>
                <Colxx xxs="6" md="2"><DateCalendar name="dateFrom" value={filters.dateFrom} onChange={onFilterChange} label="page.entryBalancing.filter.dateFrom" /></Colxx>
                <Colxx xxs="6" md="2"><DateCalendar name="dateTo" value={filters.dateTo} onChange={onFilterChange} label="page.entryBalancing.filter.dateTo" /></Colxx>
                <Colxx xxs="12" md="2">
                  <InputField name="documentCode" value={filters.documentCode} onChange={onFilterChange} label="page.entryBalancing.filter.document" maxLength={10} />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <SearchSelect name="category" inputValue={filters.category} onChange={onFilterChange} label="page.entryBalancing.filter.category" options={categoryOptions} />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <SearchSelect name="status" inputValue={filters.status} onChange={onFilterChange} label="page.entryBalancing.filter.status" options={statusOptions} isClearable={false} />
                </Colxx>
              </Row>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <Button color="primary" size="sm" onClick={fnSearch}><i className="bi bi-search" /> {t('page.entryBalancing.button.search')}</Button>
                <Button color="success" outline size="sm" onClick={fnExport}><i className="bi bi-file-earmark-excel" /> {t('page.entryBalancing.button.export')}</Button>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-3">
            <CardBody>
              <div className="fw-bold mb-2">{t('page.entryBalancing.summary.title')}</div>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  color={filters.category === '' ? 'dark' : 'light'}
                  onClick={() => fnPickCategory('')}
                >
                  {t('page.entryBalancing.summary.all')}
                  <div className="small">{t('page.entryBalancing.summary.counts', totals)}</div>
                </Button>
                {summary.map((s) => {
                  const meta = categoryMeta(s.category);
                  const active = filters.category === s.category;
                  return (
                    <Button key={s.category} size="sm" color={active ? meta.color : 'light'} outline={!active} onClick={() => fnPickCategory(s.category)}>
                      {t(meta.labelKey)}
                      <div className="small">{t('page.entryBalancing.summary.counts', s)}</div>
                    </Button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="border rounded p-2 mb-3 bg-light">
                <div className="fw-bold small mb-1">
                  {t('page.entryBalancing.bar.title')} · {t('page.entryBalancing.table.selected')}: {selectedItems.length}
                </div>
                {selectedItems.length === 0 && <span className="small text-muted">{t('page.entryBalancing.bar.none')}</span>}
                {mixed && <span className="small text-danger">{t('page.entryBalancing.bar.mixed')}</span>}
                {selectedItems.length > 0 && !privileges.repair && <span className="small text-danger">{t('page.entryBalancing.bar.noPermission')}</span>}
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {privileges.repair && !allIgnored && actions.map((action) => (
                    <Button key={action} size="sm" color={action === 'IGNORE' ? 'secondary' : 'primary'} outline={action === 'IGNORE'} disabled={busy} onClick={() => fnStartAction(action)}>
                      {t(actionLabelKey(action))}
                    </Button>
                  ))}
                  {privileges.repair && allIgnored && (
                    <Button size="sm" color="warning" disabled={busy} onClick={fnReopen}>
                      <i className="bi bi-arrow-counterclockwise" /> {t('page.entryBalancing.button.reopen')}
                    </Button>
                  )}
                  {selectedItems.length > 0 && (
                    <Button size="sm" color="link" onClick={fnClearSelection}>{t('page.entryBalancing.button.cancel')}</Button>
                  )}
                </div>
              </div>

              <Table bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>
                      <Input type="checkbox" checked={pageAllSelected} onChange={fnTogglePage} title={t('page.entryBalancing.table.selectAll')} />
                    </th>
                    <th>{t('page.entryBalancing.table.entry')}</th>
                    <th>{t('page.entryBalancing.table.document')}</th>
                    <th>{t('page.entryBalancing.table.date')}</th>
                    <th>{t('page.entryBalancing.table.description')}</th>
                    <th className="text-end">{t('page.entryBalancing.table.debit')}</th>
                    <th className="text-end">{t('page.entryBalancing.table.credit')}</th>
                    <th className="text-end">{t('page.entryBalancing.table.difference')}</th>
                    <th>{t('page.entryBalancing.table.category')}</th>
                    <th>{t('page.entryBalancing.table.period')}</th>
                    <th>{t('page.entryBalancing.table.status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={12} className="text-center text-muted">{t('page.entryBalancing.table.empty')}</td></tr>
                  )}
                  {items.map((item) => {
                    const cat = categoryMeta(item.category);
                    const st = statusMeta(item.status);
                    return (
                      <tr key={item.key} className={item.periodClosed ? 'table-warning' : undefined}>
                        <td><Input type="checkbox" checked={Boolean(selected[item.key])} onChange={() => fnToggle(item)} /></td>
                        <td>{item.nopda || '-'}</td>
                        <td>{item.documentCode} {item.documentId}</td>
                        <td>{DateHelper.format(item.date)}</td>
                        <td>{item.description}</td>
                        <td className="text-end">{formatNumber(item.debit)}</td>
                        <td className="text-end">{formatNumber(item.credit)}</td>
                        <td className="text-end fw-bold">{formatNumber(item.difference)}</td>
                        <td>
                          <Badge color={cat.color}>{t(cat.labelKey)}</Badge>
                          {item.subcategory && <div className="small text-muted">{t(subcategoryLabelKey(item.subcategory))}</div>}
                        </td>
                        <td>{item.periodClosed ? <Badge color="danger">{t('page.entryBalancing.table.closed')}</Badge> : t('page.entryBalancing.table.open')}</td>
                        <td><Badge color={st.color}>{t(st.labelKey)}</Badge></td>
                        <td>
                          <Button color="link" size="sm" onClick={() => fnOpenDetail(item)} title={t('page.entryBalancing.button.detail')}>
                            <i className="bi bi-search" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">{t('page.entryBalancing.table.rows')}: {pagination.total || 0}</span>
                <div className="d-flex align-items-center gap-2">
                  <Button size="sm" outline disabled={page <= 1} onClick={() => load(page - 1)}><i className="bi bi-chevron-left" /></Button>
                  <span className="small">{t('page.entryBalancing.table.page')} {page} / {totalPages}</span>
                  <Button size="sm" outline disabled={page >= totalPages} onClick={() => load(page + 1)}><i className="bi bi-chevron-right" /></Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...modalDetail} />
      <Modal {...modalPreview} />
      <Modal {...modalIgnore} />
    </>
  );
};

export default Content;
