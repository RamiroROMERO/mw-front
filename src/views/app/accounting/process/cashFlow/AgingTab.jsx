import { useState } from 'react';
import classnames from 'classnames';
import { Button, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';
import { WEEK_FIELDS, AGING_FIELDS, FIELD_LABELS } from './useCashFlow';

// Pestaña "Cuenta por Pagar"/"Cuenta por Cobrar" del legacy — comparten exactamente la misma
// estructura (2 sub-pestañas "Por Semana"/"Comercial" + botón "Por Tipo" + Print/Export), solo
// cambia el nombre del campo (proveedor vs cliente) y el endpoint que ya trajo useCashFlow.
const AgingTab = ({ rows, nameField, nameLabel, fnOpenByType, fnPrint, fnExportXlsx }) => {
  const [subTab, setSubTab] = useState('1');

  const weekColumns = [
    { text: nameLabel, dataField: nameField, headerStyle: { width: '30%' } },
    { text: IntlMessages('page.cashFlow.table.type'), dataField: 'typeName', headerStyle: { width: '15%' } },
    ...WEEK_FIELDS.map((f) => ({ text: IntlMessages(FIELD_LABELS[f]), dataField: f, type: 'number' }))
  ];
  const agingColumns = [
    { text: nameLabel, dataField: nameField, headerStyle: { width: '30%' } },
    { text: IntlMessages('page.cashFlow.table.type'), dataField: 'typeName', headerStyle: { width: '15%' } },
    ...AGING_FIELDS.map((f) => ({ text: IntlMessages(FIELD_LABELS[f]), dataField: f, type: 'number' }))
  ];

  return (
    <>
      <Row className="mb-2">
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button
            color="secondary"
            onClick={() => fnOpenByType(rows, subTab === '1' ? WEEK_FIELDS : AGING_FIELDS, 'page.cashFlow.modal.byType.title')}
          >
            <i className="bi bi-collection" /> {IntlMessages('page.cashFlow.button.byType')}
          </Button>
        </Colxx>
      </Row>
      <Nav tabs className="separator-tabs ms-0 mb-2">
        <NavItem>
          <NavLink
            className={classnames({ active: subTab === '1', 'nav-link': true })}
            onClick={() => setSubTab('1')}
          >
            {IntlMessages('page.cashFlow.tab.byWeek')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: subTab === '2', 'nav-link': true })}
            onClick={() => setSubTab('2')}
          >
            {IntlMessages('page.cashFlow.tab.byAging')}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={subTab}>
        <TabPane tabId="1">
          <ReactTable columns={weekColumns} data={rows} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
        </TabPane>
        <TabPane tabId="2">
          <ReactTable columns={agingColumns} data={rows} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
        </TabPane>
      </TabContent>
    </>
  );
}

export default AgingTab;
