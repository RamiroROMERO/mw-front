import { Row, Card, CardBody, CardTitle, Button, Alert, Badge } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import DateHelper from '@Helpers/DateHelper';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import { formatMonth } from './depreciationApplyRules';
import { useDepreciationApply } from './useDepreciationApply';

const money = (value) => formatNumber(value, '', 2);

const Content = ({ setLoading }) => {
  // IntlMessages es un hook: no se puede llamar dentro de condiciones. Con intl.formatMessage da igual dónde se use.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const {
    month, monthList, onChangeMonth, preview, summary, assetRows, warnings, history, monthNames, canPressApply,
    canEditPosted, fnAskApply, fnAskUnapply, fnRefresh, propsToMsgApply, propsToMsgUnapply
  } = useDepreciationApply({ setLoading });

  const previewColumns = [
    { text: t('page.depreciationApply.column.asset'), dataField: 'assetCode', headerStyle: { width: '14%' } },
    { text: t('page.depreciationApply.column.name'), dataField: 'assetName', headerStyle: { width: '24%' } },
    { text: t('page.depreciationApply.column.area'), dataField: 'areaName', headerStyle: { width: '14%' }, cell: ({ row }) => row.original.areaName || '-' },
    { text: t('page.depreciationApply.column.debit'), dataField: 'debitAccount', headerStyle: { width: '14%' } },
    { text: t('page.depreciationApply.column.credit'), dataField: 'creditAccount', headerStyle: { width: '14%' } },
    { text: t('page.depreciationApply.column.lines'), dataField: 'count', headerStyle: { width: '6%' } },
    { text: t('page.depreciationApply.column.value'), dataField: 'value', headerStyle: { width: '14%', textAlign: 'right' }, cell: ({ row }) => <div className="text-end">{money(row.original.value)}</div> }
  ];

  const historyColumns = [
    { text: t('page.depreciationApply.column.month'), dataField: 'periodMonth', headerStyle: { width: '20%' }, cell: ({ row }) => formatMonth(row.original.periodMonth, monthNames) },
    { text: t('page.depreciationApply.column.dateApply'), dataField: 'dateApply', headerStyle: { width: '16%' }, cell: ({ row }) => DateHelper.format(row.original.dateApply) },
    { text: t('page.depreciationApply.column.entry'), dataField: 'pdaNumber', headerStyle: { width: '16%' }, cell: ({ row }) => (row.original.hasEntry ? row.original.pdaNumber : '-') },
    { text: t('page.depreciationApply.column.lines'), dataField: 'linesCount', headerStyle: { width: '12%' } },
    { text: t('page.depreciationApply.column.total'), dataField: 'total', headerStyle: { width: '20%', textAlign: 'right' }, cell: ({ row }) => <div className="text-end">{money(row.original.total)}</div> }
  ];

  const historyActions = [{
    color: 'danger',
    icon: 'arrow-counterclockwise',
    toolTip: 'page.depreciationApply.button.unapply',
    onClick: fnAskUnapply
  }];

  return (
    <>
      <Row>
        <Colxx xs="12">
          <Card className="mb-4">
            <CardBody>
              <Row>
                <Colxx xxs="12" md="4">
                  <SearchSelect name="month" label="page.depreciationApply.select.month" inputValue={month}
                    onChange={onChangeMonth} options={monthList} isClearable={false} />
                </Colxx>
                <Colxx xxs="12" md="8" className="d-flex align-items-end justify-content-end gap-2">
                  <Button color="secondary" size="sm" className="mb-3" onClick={fnRefresh}>
                    <i className="bi bi-arrow-repeat" /> {t('page.depreciationApply.button.refresh')}
                  </Button>
                  <Button color="primary" size="sm" className="mb-3" onClick={fnAskApply} disabled={!canPressApply}>
                    <i className="bi bi-check2-square" /> {t('page.depreciationApply.button.apply')}
                  </Button>
                </Colxx>
              </Row>
              <Alert color="info" className="mb-3">{t('page.depreciationApply.notice.scope')}</Alert>
              {!canEditPosted && (
                <Alert color="warning" className="mb-3">{t('page.depreciationApply.notice.noUnapply')}</Alert>
              )}
              {preview && summary.linesCount + summary.zeroCount === 0 && (
                <Alert color="secondary" className="mb-3">{t('page.depreciationApply.notice.nothingPending')}</Alert>
              )}
              {warnings.length > 0 && (
                <Alert color="warning" className="mb-3">
                  <strong>{t('page.depreciationApply.notice.warnings')}</strong>
                  <ul className="mb-0 mt-1">
                    {warnings.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                </Alert>
              )}
              {preview && summary.linesCount + summary.zeroCount > 0 && (
                <>
                  <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
                    <Badge color="primary" pill>{t('page.depreciationApply.summary.dateApply')}: {DateHelper.format(summary.dateApply)}</Badge>
                    <Badge color="primary" pill>{t('page.depreciationApply.summary.total')}: {money(summary.total)}</Badge>
                    <Badge color="secondary" pill>{t('page.depreciationApply.summary.assets')}: {summary.assetsCount}</Badge>
                    <Badge color="secondary" pill>{t('page.depreciationApply.summary.lines')}: {summary.linesCount}</Badge>
                    {summary.zeroCount > 0 && (
                      <Badge color="light" pill className="text-dark">{t('page.depreciationApply.summary.zeroLines')}: {summary.zeroCount}</Badge>
                    )}
                  </div>
                  <ReactTable columns={previewColumns} data={assetRows} />
                </>
              )}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xs="12">
          <Card>
            <CardBody>
              <CardTitle>{t('page.depreciationApply.title.history')}</CardTitle>
              <ReactTable columns={historyColumns} data={history} actions={historyActions} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgApply} />
      <Confirmation {...propsToMsgUnapply} />
    </>
  );
};

export default Content;
