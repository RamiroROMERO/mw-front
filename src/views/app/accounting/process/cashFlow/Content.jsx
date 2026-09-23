import classnames from 'classnames';
import { Button, Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import Modal from '@Components/modal';
import { IntlMessages } from '@Helpers/Utils';
import ResumenTab from './ResumenTab';
import AgingTab from './AgingTab';
import { useCashFlow } from './useCashFlow';

const CashFlow = ({ setLoading }) => {
  const { activeTab, setActiveTab, propsToHeader, propsToResumenTab, propsToPayableTab, propsToReceivableTab, propsToModalByType } = useCashFlow({ setLoading });
  const { date, onInputChange, fnSearch, fnPrintSummary, fnExportSummaryXlsx } = propsToHeader;

  return (
    <>
      <Row className="mb-3">
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12" md="4" lg="3">
                  <DateCalendar
                    name="date"
                    label="page.cashFlow.input.date"
                    value={date}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" md="8" lg="9" className="div-action-button-container align-items-end">
                  <Button color="secondary" onClick={fnPrintSummary}>
                    <i className="iconsminds-printer" /> {IntlMessages('button.print')}
                  </Button>
                  <Button color="secondary" onClick={fnExportSummaryXlsx}>
                    <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
                  </Button>
                  <Button color="primary" onClick={fnSearch}>
                    <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Nav tabs className="separator-tabs ms-0 mb-2">
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '1', 'nav-link': true })} onClick={() => setActiveTab('1')}>
            {IntlMessages('page.cashFlow.tab.summary')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '2', 'nav-link': true })} onClick={() => setActiveTab('2')}>
            {IntlMessages('page.cashFlow.tab.payable')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '3', 'nav-link': true })} onClick={() => setActiveTab('3')}>
            {IntlMessages('page.cashFlow.tab.receivable')}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <ResumenTab {...propsToResumenTab} />
        </TabPane>
        <TabPane tabId="2">
          <AgingTab {...propsToPayableTab} />
        </TabPane>
        <TabPane tabId="3">
          <AgingTab {...propsToReceivableTab} />
        </TabPane>
      </TabContent>
      <Modal {...propsToModalByType} />
    </>
  );
}
export default CashFlow;
