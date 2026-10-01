import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';

export const ModalPrintConciliation = ({ data }) => {
  const { fnPrint } = data;

  return (
    <Row>
      <Colxx xxs="12" md="6" className="mb-2">
        <Button color="primary" block onClick={() => fnPrint('summary')}>
          <i className="bi bi-file-earmark-pdf" /> {IntlMessages('page.bankConciliation.print.summary')}
        </Button>
      </Colxx>
      <Colxx xxs="12" md="6" className="mb-2">
        <Button color="secondary" block onClick={() => fnPrint('detailed')}>
          <i className="bi bi-file-earmark-pdf" /> {IntlMessages('page.bankConciliation.print.detailed')}
        </Button>
      </Colxx>
    </Row>
  );
}
