import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useModuleAudit } from './useModuleAudit';

const ModuleAudit = ({ setLoading }) => {
  const { table, totals, propsToHeader, propsToModalPdaDetail } = useModuleAudit({ setLoading });

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
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="8">
          <Card>
            <CardBody>
              <TotalsReport {...totals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPdaDetail} />
    </>
  );
}
export default ModuleAudit;
