import { Row } from 'reactstrap';
import IntlMessages from '@Helpers/IntlMessages';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const BlankPage = ({ match }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.blank-page" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-4">
          <p>
            <IntlMessages id="menu.blank-page" />
          </p>
        </Colxx>
      </Row>
    </>
  );
};

export default BlankPage;
