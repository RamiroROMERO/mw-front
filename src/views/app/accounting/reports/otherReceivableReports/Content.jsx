import classnames from 'classnames';
import { Card, CardBody, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import { useOtherReceivableReports } from './useOtherReceivableReports';

const OtherReceivableReports = ({ setLoading }) => {
  const { activeTab, setActiveTab, propsToHeader, propsToAgingHeader, statementTable, agingTable } = useOtherReceivableReports({ setLoading });
  const { bucket, bucketOptions, onInputChange } = propsToAgingHeader;

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
            {IntlMessages('page.otherReceivableReports.tab.statement')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '2', 'nav-link': true })} onClick={() => setActiveTab('2')}>
            {IntlMessages('page.otherReceivableReports.tab.aging')}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <ReactTable {...statementTable} />
        </TabPane>
        <TabPane tabId="2">
          <Row className="mb-2">
            <Colxx xxs="12" md="4" lg="3">
              <SimpleSelect
                name="bucket"
                label="page.otherReceivableReports.input.bucket"
                value={bucket}
                onChange={onInputChange}
                options={bucketOptions}
              />
            </Colxx>
          </Row>
          <ReactTable {...agingTable} />
        </TabPane>
      </TabContent>
    </>
  );
}
export default OtherReceivableReports;
