import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ yearText, setYearText, yearError, load, settings, t }) => (
  <>
    <Row>
      <Colxx xxs="12" md="4" lg="3">
        <InputField
          name="year"
          label="page.moduleOpeningClosing.input.year"
          value={yearText}
          onChange={(e) => setYearText(e.target.value)}
          type="text"
          maxLength={4}
          feedbackText={yearError}
          invalid={Boolean(yearError)}
        />
      </Colxx>
      <Colxx xxs="12" md="4" className="d-flex align-items-end">
        <Button color="primary" onClick={() => load(yearText)}>
          <i className="bi bi-search" /> {IntlMessages('page.moduleOpeningClosing.button.query')}
        </Button>
      </Colxx>
    </Row>
    {!settings.closingEnforced && (
      <Row className="mt-2"><Colxx xxs="12"><div className="alert alert-warning mb-0">{t('page.moduleOpeningClosing.msg.notEnforced')}</div></Colxx></Row>
    )}
    {settings.globalCloseDate && (
      <Row className="mt-2"><Colxx xxs="12"><div className="alert alert-info mb-0">{`${t('page.moduleOpeningClosing.msg.globalClose')} ${settings.globalCloseDate}`}</div></Colxx></Row>
    )}
  </>
);

export default HeaderReport;
