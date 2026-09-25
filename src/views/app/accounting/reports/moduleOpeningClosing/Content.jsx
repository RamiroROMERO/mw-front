import { useEffect } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import { useModuleOpeningClosing } from './useModuleOpeningClosing';

const ModuleOpeningClosing = ({ setLoading }) => {
  const { table, propsToHeader, propsToConfirmAll, propsToModalEdit, fnGenerate } = useModuleOpeningClosing({ setLoading });

  useEffect(() => {
    fnGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Colxx xxs="12" md="8">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalEdit} />
      <Confirmation {...propsToConfirmAll} />
    </>
  );
}
export default ModuleOpeningClosing;
