import classnames from 'classnames';
import { Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useModuleAudit } from './useModuleAudit';

const ModuleAudit = ({ setLoading }) => {
  const { activeTab, setActiveTab, table, summaryTable, propsToHeader, propsToTotals, propsToModalPdaDetail } = useModuleAudit({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeader} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Nav tabs className="separator-tabs ms-0 mb-2">
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '1', 'nav-link': true })} onClick={() => setActiveTab('1')}>
            {IntlMessages('page.moduleAudit.tab.detail')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '2', 'nav-link': true })} onClick={() => setActiveTab('2')}>
            {IntlMessages('page.moduleAudit.tab.summary')}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Colxx xxs="12" className="mb-3">
              <Card>
                <CardBody>
                  <TotalsReport {...propsToTotals} />
                </CardBody>
              </Card>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12" className="mb-3">
              <ReactTable {...table} />
            </Colxx>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Colxx xxs="12" className="mb-3">
              <ReactTable {...summaryTable} />
            </Colxx>
          </Row>
        </TabPane>
      </TabContent>
      <Modal {...propsToModalPdaDetail} />
    </>
  );
};
export default ModuleAudit;
