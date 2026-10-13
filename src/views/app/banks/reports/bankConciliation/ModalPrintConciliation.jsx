import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';

export const ModalPrintConciliation = ({ data }) => {
  const { fnPrint } = data;

  return (
    <Row>
      <Colxx xxs="12" className="mb-3">
        <small className="text-muted">{IntlMessages('page.bankConciliation.print.note')}</small>
      </Colxx>
      <Colxx xxs="12" md="4" className="mb-2">
        <Button color="primary" block onClick={() => fnPrint('summary')}>
          <i className="bi bi-file-earmark-pdf" /> {IntlMessages('page.bankConciliation.print.summary')}
        </Button>
      </Colxx>
      <Colxx xxs="12" md="4" className="mb-2">
        <Button color="secondary" block onClick={() => fnPrint('detailed')}>
          <i className="bi bi-file-earmark-pdf" /> {IntlMessages('page.bankConciliation.print.detailed')}
        </Button>
      </Colxx>
      <Colxx xxs="12" md="4" className="mb-2">
        <Button color="success" block onClick={() => fnPrint(undefined, 'xlsx')}>
          <i className="bi bi-file-earmark-excel" /> {IntlMessages('page.bankConciliation.print.excel')}
        </Button>
      </Colxx>
    </Row>
  );
}
