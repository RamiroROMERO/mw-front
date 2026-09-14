import ReactTable from '@Components/reactTable'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { useModalCashClose } from './useModalCashClose';

const ModalCashClose = ({ data, setOpen }) => {
  const { setLoading, startDate, endDate } = data;

  const { table, fnViewReport } = useModalCashClose({ setLoading, startDate, endDate });

  return (
    <>
      <ModalBody>
        <Row className='mb-3'>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="primary" onClick={() => { fnViewReport() }}>
              <i className='bi bi-search' /> {IntlMessages("button.viewReport")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalCashClose
