import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Modal from '@Components/modal';
import HeaderForm from './HeaderForm';
import { LinesTable } from './LinesTable';
import TotalsPanel from './TotalsPanel';
import { ModalNewConciliation } from './ModalNewConciliation';
import { ModalSearchConciliation } from './ModalSearchConciliation';
import { useBankConciliation } from './useBankConciliation';

const BankConciliation = ({ setLoading }) => {
  const {
    header, onInputChangeHeader, lines, fnToggleConBank, fnToggleConBook, propsToControlPanel,
    propsToModalNew, propsToModalSearch, openModalNew, setOpenModalNew, openModalSearch, setOpenModalSearch,
    propsToTotals
  } = useBankConciliation({ setLoading });

  const propsToModalNewWrapper = {
    ModalContent: ModalNewConciliation,
    title: 'page.bankConciliation.modal.title.new',
    open: openModalNew,
    setOpen: setOpenModalNew,
    maxWidth: 'md',
    data: propsToModalNew
  }

  const propsToModalSearchWrapper = {
    ModalContent: ModalSearchConciliation,
    title: 'page.bankConciliation.modal.title.search',
    open: openModalSearch,
    setOpen: setOpenModalSearch,
    maxWidth: 'lg',
    data: propsToModalSearch
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <HeaderForm header={header} onInputChangeHeader={onInputChangeHeader} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <LinesTable lines={lines} fnToggleConBank={fnToggleConBank} fnToggleConBook={fnToggleConBook} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsPanel propsToTotals={propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalNewWrapper} />
      <Modal {...propsToModalSearchWrapper} />
    </>
  );
}
export default BankConciliation;
