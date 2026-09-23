import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useDiaryBook } from './useDiaryBook';

const DiaryBook = ({ setLoading }) => {
  const { table, propsToHeaderReport, propsToTotals, propsToModalViewEntry } = useDiaryBook({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
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
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewEntry} />
    </>
  );
}
export default DiaryBook;
