import { useState } from 'react';
import { useIntl } from 'react-intl';
import classnames from 'classnames';
import { Button, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { WEEK_FIELDS, AGING_FIELDS, FIELD_LABELS } from './cashFlowRules';

// Pestaña "Cuenta por Pagar"/"Cuenta por Cobrar" (cont_flujoefect.sc2): comparten la misma estructura (2 sub-pestañas "Por Semana"/"Comercial" y un botón "Por Tipo"); solo cambia el nombre (proveedor o
// cliente). Todo viene calculado del back; el ícono de cada fila abre sus documentos. Un solo `useIntl` (IntlMessages es un hook).
const AgingTab = ({ data, kind, nameField, nameLabel, fnOpenByType, fnOpenDocuments }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const [subTab, setSubTab] = useState('1');
  if (!data) return null;

  const actionColumn = {
    text: '',
    dataField: 'actions',
    headerStyle: { width: '3%' },
    cell: ({ row }) => (
      <i className="bi bi-eye-fill cursor-pointer" title={t('page.cashFlow.button.documents')} onClick={() => fnOpenDocuments(kind, row.original)} />
    )
  };
  const columnsFor = (fields) => [
    { text: t(nameLabel), dataField: nameField, headerStyle: { width: '26%' } },
    { text: t('page.cashFlow.table.type'), dataField: 'typeName', headerStyle: { width: '12%' } },
    ...fields.map((f) => ({ text: t(FIELD_LABELS[f]), dataField: f, type: 'number' })),
    actionColumn
  ];

  return (
    <>
      <Row className="mb-2">
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={() => fnOpenByType(data.byType, subTab === '1' ? WEEK_FIELDS : AGING_FIELDS, 'page.cashFlow.modal.byType.title')}>
            <i className="bi bi-collection" /> {t('page.cashFlow.button.byType')}
          </Button>
        </Colxx>
      </Row>
      <Nav tabs className="separator-tabs ms-0 mb-2">
        <NavItem>
          <NavLink className={classnames({ active: subTab === '1', 'nav-link': true })} onClick={() => setSubTab('1')}>
            {t('page.cashFlow.tab.byWeek')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: subTab === '2', 'nav-link': true })} onClick={() => setSubTab('2')}>
            {t('page.cashFlow.tab.byAging')}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={subTab}>
        <TabPane tabId="1">
          <ReactTable columns={columnsFor(WEEK_FIELDS)} data={data.rows} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
        </TabPane>
        <TabPane tabId="2">
          <ReactTable columns={columnsFor(AGING_FIELDS)} data={data.rows} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
        </TabPane>
      </TabContent>
    </>
  );
};

export default AgingTab;
